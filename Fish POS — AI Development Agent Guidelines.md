# Fish POS — AI Development Agent Guidelines

## 1. Purpose

This document defines the mandatory guidelines that an AI/software development agent must follow while developing the **Fish POS** platform.

The system will be developed in three phases:

1. **Phase 1 — Retail POS + Inventory**
2. **Phase 2 — Online Sales**
3. **Phase 3 — Integrations**

The core technology stack is:

- **Frontend:** React + TypeScript
- **Backend:** Python + FastAPI
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Database Migration:** Alembic
- **API:** REST, versioned
- **Authentication:** JWT/OAuth-based
- **Deployment:** Docker-oriented
- **Architecture:** Modular and integration-ready

The agent must follow the rules in this document for every implementation, modification, refactoring, and bug fix.

---

# 2. General Development Principles

### 2.1 Build for the complete product

The agent must not implement features as isolated temporary solutions.

Every feature should consider:

- Phase 1 requirements
- Phase 2 expansion
- Phase 3 integrations
- Multi-store readiness
- Auditability
- Security
- Maintainability

The agent should avoid designs that work only for the current screen or phase when they would create significant rework later.

### 2.2 Prefer simple architecture first

Do not introduce microservices, distributed systems, or unnecessary infrastructure without a clear requirement.

The default architecture should be:

```text
React
   ↓
FastAPI
   ↓
Service / Business Logic
   ↓
Repository / Data Access
   ↓
PostgreSQL
```

Use clear module boundaries so components can be separated later if required.

### 2.3 Never duplicate business logic

Business rules must have one authoritative implementation.

For example:

**Incorrect**

```text
React calculates stock
FastAPI calculates stock
Report calculates stock again
```

**Correct**

```text
FastAPI business logic
       ↓
Authoritative inventory transaction
       ↓
React displays result
```

The frontend must not become the source of truth for inventory, price calculations, payment state, order state, or financial totals.

---

# 3. Requirement Handling

Before implementing a feature, the agent should identify:

- Business objective
- User role
- Functional requirements
- Data required
- API required
- UI required
- Validation rules
- Security implications
- Inventory implications
- Reporting implications
- Future integration implications

For ambiguous requirements, the agent should make the safest reasonable interpretation based on the existing system design rather than introducing assumptions that conflict with the architecture.

### Requirement Priority

Use the following priority:

```text
1. Business correctness
2. Data integrity
3. Security
4. User workflow
5. Performance
6. Maintainability
7. UI polish
```

---

# 4. Phase Management

The agent must respect phase boundaries.

## Phase 1

Focus on:

- Retail POS
- Products
- Categories
- Suppliers
- Purchases
- Inventory
- Customers
- Sales
- Payments
- Returns
- Wastage
- Reports

Do not introduce unnecessary online commerce functionality into the Phase 1 user interface.

However, the underlying model should be designed so Phase 2 can be added without redesigning core inventory and order concepts.

## Phase 2

Add:

- Online catalog
- Customer accounts
- Cart
- Checkout
- Online orders
- Stock reservation
- Online payments
- Delivery/pickup
- Online reporting

Reuse Phase 1 services wherever possible.

## Phase 3

Add:

- Payment integrations
- Accounting
- Tax/GST integrations
- Delivery providers
- Messaging
- Hardware
- External APIs
- Webhooks
- Reconciliation
- Integration monitoring

---

# 5. Frontend Guidelines — React

## 5.1 Use TypeScript

All new React code should use TypeScript.

Avoid:

```typescript
const data: any = ...
```

Prefer explicit types/interfaces.

Do not use `any` unless there is a documented technical reason.

---

## 5.2 Component Design

Components should have one clear responsibility.

Prefer:

```text
ProductSearch
ProductGrid
Cart
PaymentPanel
SaleSummary
```

over one very large POS component containing all logic.

Use reusable components for:

- Forms
- Buttons
- Tables
- Dialogs
- Inputs
- Selects
- Date pickers
- Currency/quantity display
- Error messages

---

## 5.3 Business Logic

Business rules should not be implemented primarily in React.

React may handle:

- UI state
- Form state
- Loading state
- Temporary cart state
- Display formatting

FastAPI should handle:

- Price rules
- Inventory rules
- Tax calculations
- Order validation
- Payment state
- Stock reservation
- Authorization
- Financial totals

---

## 5.4 API Communication

All backend communication should go through a consistent API client layer.

Do not scatter raw HTTP requests throughout components.

Prefer:

```text
React Component
      ↓
Hook / Query Layer
      ↓
API Client
      ↓
FastAPI
```

Use consistent handling for:

- Authentication
- Loading
- Errors
- Retries
- Pagination
- Validation responses

---

## 5.5 State Management

Use local component state for local UI behavior.

Use shared state only when genuinely required.

Do not put all application data into a single global state store.

Server state should be treated separately from UI state.

---

## 5.6 Forms

All forms must:

- Validate required fields
- Display useful errors
- Prevent duplicate submission
- Handle API validation errors
- Preserve user-entered data where reasonable
- Clearly distinguish required and optional fields

---

## 5.7 POS UX

The POS is a high-frequency operational screen.

Optimize for:

- Fast product search
- Keyboard navigation
- Barcode scanner input
- Weight entry
- Minimal clicks
- Clear totals
- Fast payment completion
- Clear error messages

Avoid unnecessary dialogs or screens during normal checkout.

---

# 6. Backend Guidelines — FastAPI

## 6.1 Layered Structure

Use a clear separation such as:

```text
app/
  api/
  models/
  schemas/
  services/
  repositories/
  core/
  integrations/
  workers/
  tests/
```

The exact structure may evolve, but responsibilities must remain separated.

---

## 6.2 API Endpoints

Use versioned APIs:

```text
/api/v1/...
```

Use REST conventions consistently.

Examples:

```text
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/{id}
PATCH  /api/v1/products/{id}
DELETE /api/v1/products/{id}
```

Do not create inconsistent endpoint naming such as:

```text
/getProducts
/createProductNow
/doStockAdjustment
```

---

## 6.3 Pydantic Schemas

Separate API schemas from database models.

For example:

```text
Product
ProductCreate
ProductUpdate
ProductResponse
```

Do not expose database models directly as the API contract unless there is a deliberate reason.

---

## 6.4 Service Layer

Business operations should be implemented in services.

Example:

```text
SaleService
InventoryService
PurchaseService
OrderService
PaymentService
```

The API route should orchestrate the request, not contain the complete business workflow.

---

# 7. Database Guidelines — PostgreSQL

## 7.1 Database is the Source of Truth

For business-critical data, PostgreSQL is authoritative.

This includes:

- Inventory
- Sales
- Purchases
- Payments
- Orders
- Customers
- Products

---

## 7.2 Use Transactions

Any operation involving multiple related records must use a database transaction.

Example:

```text
Create Sale
    ↓
Create Sale Items
    ↓
Create Payment
    ↓
Create Inventory Transaction
    ↓
Commit
```

If one required operation fails, the entire transaction should roll back.

---

## 7.3 Inventory Rules

Inventory must be transaction-based.

Do not silently modify stock values without recording the reason.

Every stock movement should have:

- Product
- Store
- Quantity
- Transaction type
- Reference
- User/system actor
- Timestamp

---

## 7.4 Concurrency

The agent must consider concurrent transactions.

Example:

```text
Stock = 1 KG

POS A attempts sale = 1 KG
POS B attempts sale = 1 KG
```

The system must not allow both transactions to successfully consume the same stock.

Use appropriate PostgreSQL transaction isolation, locking, or atomic update techniques.

---

## 7.5 Decimal Quantities

Fish may be sold by weight.

Do not use floating-point types for financial or weight values where precision matters.

Use appropriate PostgreSQL numeric/decimal types.

Examples:

```text
quantity NUMERIC
price    NUMERIC
amount   NUMERIC
```

---

## 7.6 Monetary Values

Never rely on binary floating-point calculations for monetary values.

Use decimal/numeric arithmetic.

Currency calculations should be deterministic and centrally defined.

---

## 7.7 Foreign Keys

Use proper foreign keys for related entities.

Do not rely solely on application code to maintain relationships.

---

## 7.8 Indexes

Create indexes for frequently queried fields such as:

- SKU
- Barcode
- Product name where appropriate
- Customer phone/email
- Sale date
- Order status
- Inventory product/store combination
- Transaction timestamps

Indexes should be introduced based on actual query patterns rather than indiscriminately.

---

# 8. Inventory-Specific Rules

Inventory is one of the highest-risk modules in Fish POS.

The agent must treat inventory changes as sensitive operations.

## 8.1 Never silently change inventory

Bad:

```python
product.stock -= quantity
```

Good:

```text
Create inventory transaction
Validate stock
Update inventory state
Record reference
Record actor
Commit atomically
```

---

## 8.2 Inventory Transaction Types

Use controlled transaction types such as:

```text
OPENING
PURCHASE
SALE
SALE_RETURN
PURCHASE_RETURN
ADJUSTMENT
TRANSFER_IN
TRANSFER_OUT
WASTAGE
RESERVATION
RELEASE
```

Do not create free-form transaction type strings from arbitrary UI input.

---

## 8.3 Negative Inventory

Negative stock should not be permitted unless a specific business rule explicitly enables it.

Any exception must be intentional, configurable, and auditable.

---

## 8.4 Wastage

Wastage must remain separate from normal sales.

Every wastage transaction should include a reason.

---

## 8.5 Stock Reservation

When Phase 2 is implemented, online orders should reserve inventory rather than immediately consuming physical stock where the business workflow requires fulfillment confirmation.

The agent must clearly distinguish:

```text
Available Stock
Reserved Stock
Physical Stock
```

---

# 9. Sales and Pricing Guidelines

## 9.1 Server-Side Calculation

Final totals must be calculated and validated by the backend.

The frontend may calculate estimated totals for UX, but the backend must recalculate them.

---

## 9.2 Never Trust Client Prices

The client must not be trusted to submit authoritative:

- Product price
- Discount
- Tax
- Total
- Payment amount

The backend must resolve authoritative values.

---

## 9.3 Price History

Important product price changes should be auditable.

Do not overwrite pricing history when historical reporting depends on the original transaction price.

A sale must preserve the price actually charged at the time of sale.

---

## 9.4 Historical Records

Never recalculate historical sales using today's product price.

Example:

```text
Product price today = ₹900/kg
Sale yesterday       = ₹800/kg
```

The historical sale must remain ₹800/kg.

---

# 10. Order Guidelines

Orders should have a clearly controlled lifecycle.

Example:

```text
PENDING
CONFIRMED
PROCESSING
READY
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
REFUNDED
```

The agent must define valid state transitions.

Do not allow arbitrary status changes.

For example:

```text
DELIVERED → PENDING
```

should not normally be possible.

Any exceptional transition should require a specific business rule and audit record.

---

# 11. Payment Guidelines

Payment processing must be treated as financial functionality.

## 11.1 Payment State

Use explicit states such as:

```text
PENDING
AUTHORIZED
PAID
FAILED
CANCELLED
REFUNDED
PARTIALLY_REFUNDED
```

## 11.2 Do Not Trust Browser Results

The backend must verify payment results with the payment provider when applicable.

Never mark an order as paid solely because the browser reports success.

---

## 11.3 Idempotency

Payment creation and other financial operations should support idempotency where duplicate requests are possible.

Example:

```text
Request sent
     ↓
Network timeout
     ↓
Client retries
```

The retry must not create a second payment or duplicate sale.

---

# 12. Authentication and Authorization

## 12.1 Authentication

Authenticated endpoints must verify user identity.

Do not rely on frontend route protection as a security mechanism.

---

## 12.2 Authorization

Every protected operation must check permissions on the backend.

Example:

```text
Cashier
  ✓ Create sale
  ✓ Take payment
  ✗ Approve large refund
  ✗ Adjust stock
  ✗ Change system configuration
```

---

## 12.3 Least Privilege

Users should receive only the permissions required for their role.

---

## 12.4 Sensitive Information

Never log:

- Passwords
- Authentication tokens
- Full payment secrets
- API secrets
- Private keys

---

# 13. Validation Guidelines

Validate at multiple levels.

### Frontend

For user experience.

### API

For request correctness.

### Business Service

For business rules.

### Database

For structural integrity.

Important business rules should not exist only in frontend validation.

---

# 14. Error Handling

Errors should be predictable and meaningful.

Use a consistent API error format.

Example:

```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock for Seer Fish",
    "details": {
      "available": 1.2,
      "requested": 2.0
    }
  }
}
```

Do not expose internal stack traces or database errors to end users.

---

# 15. Logging

Logs should help diagnose production problems without exposing secrets.

Recommended levels:

```text
DEBUG
INFO
WARNING
ERROR
```

Log important events such as:

- Authentication failures
- API errors
- Inventory failures
- Payment failures
- Integration failures
- Background job failures

Use correlation/request IDs where practical.

---

# 16. Audit Logging

The agent must create audit records for critical actions.

Examples:

- Price changes
- Inventory adjustments
- Wastage
- Refunds
- Sale cancellations
- User/role changes
- Configuration changes
- Integration changes

Audit data should include:

```text
Actor
Action
Entity
Entity ID
Timestamp
Old Value / relevant previous state
New Value / relevant new state
```

Do not allow ordinary users to silently modify or delete audit history.

---

# 17. Testing Requirements

No significant feature should be considered complete without tests.

## 17.1 Unit Tests

Test:

- Business rules
- Calculations
- Validation
- Services
- Utility functions

---

## 17.2 API Tests

Test:

- Success
- Validation failures
- Unauthorized access
- Forbidden access
- Missing resources
- Duplicate requests
- Edge cases

---

## 17.3 Database Tests

Test transaction behavior and important constraints.

---

## 17.4 Integration Tests

At minimum test:

```text
Purchase → Inventory
Sale → Inventory
Return → Inventory
Wastage → Inventory
Online Order → Reservation
Cancellation → Reservation Release
Payment → Order
Refund → Payment
```

---

## 17.5 End-to-End Tests

Critical business workflows should be tested from UI through API to database.

---

# 18. Definition of Done

A feature is **not complete** merely because the UI works.

A feature is complete when:

- Requirement is implemented
- API is implemented
- Validation is implemented
- Authorization is implemented
- Database changes are migrated
- Business rules are covered
- Error handling exists
- Tests are added
- Documentation is updated where necessary
- Audit requirements are considered
- No obvious regression is introduced

---

# 19. Database Migration Rules

All schema changes must use Alembic migrations.

Never manually modify production tables as part of normal development.

Every schema change should have:

```text
Migration
↓
Upgrade
↓
Test
↓
Rollback verification where appropriate
```

Migrations must be deterministic and safe.

Avoid destructive migrations unless explicitly required and safely planned.

---

# 20. API Backward Compatibility

Once an API is consumed by frontend or external systems, avoid breaking changes.

Prefer:

```text
/api/v1
/api/v2
```

when a breaking contract change is unavoidable.

Do not silently rename or remove an API field used by existing clients.

---

# 21. Integration Guidelines

Phase 3 integrations must be isolated behind adapter/service interfaces.

Example:

```text
PaymentService
      │
      ├── PaymentGatewayA
      ├── PaymentGatewayB
      └── MockPaymentGateway
```

This allows providers to be changed without rewriting the order/payment domain.

External systems should never directly manipulate core database tables.

Use APIs/services.

---

# 22. Webhook Guidelines

Webhooks must:

- Validate authenticity
- Be idempotent
- Store received event identifiers
- Handle retries
- Log failures
- Avoid duplicate processing

Example:

```text
Webhook received
      ↓
Verify signature
      ↓
Check event ID
      ↓
Process event
      ↓
Store event result
      ↓
Respond success
```

---

# 23. Security Guidelines

The agent must proactively look for:

- SQL injection
- XSS
- CSRF where relevant
- Broken authorization
- IDOR
- Sensitive data exposure
- Insecure file upload
- Weak authentication
- Excessive API access
- Missing rate limits
- Improper webhook validation

Never disable security controls simply to make a feature work.

---

# 24. Secrets Management

Secrets must never be hard-coded.

Bad:

```python
PASSWORD = "admin123"
```

Good:

```text
Environment variables
Secret manager
Deployment secrets
```

Never commit:

- Passwords
- API keys
- JWT signing secrets
- Payment credentials
- Database passwords

to source control.

---

# 25. Configuration

Configuration should be environment-specific.

Typical environments:

```text
development
testing
staging
production
```

Avoid hard-coding production URLs or credentials in application code.

---

# 26. Performance Guidelines

The agent should avoid premature optimization but should not introduce obvious inefficiencies.

Avoid:

- N+1 database queries
- Loading huge tables without pagination
- Repeated API calls for the same data
- Unbounded result sets
- Expensive calculations in React rendering
- Repeated database queries inside loops

Use pagination for large datasets.

---

# 27. Reporting Guidelines

Reports must be based on authoritative transactional data.

Do not create reports from frontend cached data as the primary source.

Reports should define:

- Date/time boundary
- Timezone
- Status inclusion/exclusion
- Return handling
- Cancellation handling
- Tax treatment
- Payment treatment

Financial reports must be consistent with transaction records.

---

# 28. Date and Time Guidelines

Store timestamps consistently.

Prefer UTC internally where appropriate, while presenting the configured business/store timezone to users.

Do not rely on the browser's local timezone for financial/business calculations.

Date ranges must define whether their end boundary is inclusive or exclusive.

---

# 29. Multi-Store Readiness

Even when only one store is initially deployed, the model should be capable of supporting:

```text
Company
   ↓
Store
   ↓
Terminal
   ↓
User
```

Inventory, sales, and stock transactions should be scoped appropriately.

Do not create assumptions that there can only ever be one store.

---

# 30. Code Quality Rules

The agent must prioritize:

- Readability
- Explicit naming
- Small functions
- Clear module ownership
- Strong typing
- Consistent patterns
- Minimal duplication

Avoid clever code that is difficult for another developer to maintain.

---

# 31. Naming Conventions

Use consistent naming.

### Python

```text
snake_case
```

### TypeScript/React

```text
camelCase
PascalCase for components/classes
```

### Database

Use consistent `snake_case` naming.

Examples:

```text
product_id
created_at
updated_at
inventory_transaction
```

---

# 32. Comments and Documentation

Comments should explain **why**, not merely repeat **what** the code does.

Bad:

```python
# Increment stock
stock += quantity
```

Useful:

```python
# Stock is updated within the same transaction as the sale
# so a failed payment cannot leave inventory in an inconsistent state.
```

Document non-obvious business rules.

---

# 33. Refactoring Guidelines

The agent may refactor existing code when necessary, but:

- Preserve behavior unless intentionally changing it
- Add/update tests
- Avoid mixing unrelated refactoring with feature changes
- Keep changes reviewable
- Avoid large rewrites without a clear architectural reason

---

# 34. Dependency Guidelines

Do not add a third-party package simply because it is convenient.

Before adding a dependency, consider:

- Is it necessary?
- Is the project already solving this problem?
- Is it maintained?
- Does it introduce security risk?
- Does it significantly increase complexity?
- Is there a lightweight alternative?

Keep dependencies minimal.

---

# 35. Development Workflow for the Agent

For every task, follow this sequence:

```text
1. Understand requirement
        ↓
2. Identify affected modules
        ↓
3. Review existing implementation
        ↓
4. Design data/API/business changes
        ↓
5. Implement backend/domain logic
        ↓
6. Implement database migration
        ↓
7. Implement frontend
        ↓
8. Add validation/error handling
        ↓
9. Add tests
        ↓
10. Run tests/lint/type checks
        ↓
11. Review security and edge cases
        ↓
12. Document important changes
```

Do not start by changing the UI when the underlying business/data model is not understood.

---

# 36. Change Impact Analysis

Before modifying a shared entity such as:

- Product
- Inventory
- Sale
- Order
- Customer
- Payment

the agent should identify affected areas.

Example:

```text
Product price change
       ↓
POS
Online store
Sales
Reports
Promotions
Invoices
Integrations
```

Changes to foundational models must be treated carefully.

---

# 37. Bug Fix Guidelines

When fixing a bug:

1. Reproduce the problem.
2. Identify the root cause.
3. Fix the underlying issue.
4. Add a regression test.
5. Verify related workflows.
6. Check whether the same pattern exists elsewhere.

Do not apply a UI-only workaround to hide a backend data problem.

---

# 38. Data Integrity Priority

When there is a conflict between speed of implementation and data correctness, choose data correctness.

The agent must never knowingly create:

- Duplicate sales
- Duplicate payments
- Incorrect stock
- Orphaned records
- Untraceable refunds
- Inconsistent order statuses
- Un-audited inventory adjustments

---

# 39. Production Safety Rules

The agent must be conservative with production-impacting changes.

Before a destructive operation, consider:

- Backup
- Migration safety
- Data compatibility
- Rollback
- Existing records
- Existing integrations
- Existing frontend clients

Never assume the database is empty.

---

# 40. Prohibited Development Practices

The agent must not:

- Hard-code secrets
- Trust client-provided financial totals
- Trust client-provided inventory values
- Directly edit production data to "fix" application logic
- Disable authorization to simplify development
- Disable validation to make requests succeed
- Delete audit history as a normal cleanup operation
- Use floating point for authoritative monetary calculations
- Create duplicated inventory logic
- Create untracked stock changes
- Introduce breaking API changes without versioning/compatibility strategy
- Add dependencies without justification
- Ignore failing tests without documenting the reason

---

# 41. Agent Response Format for Development Tasks

For each implementation task, the agent should provide a concise change summary containing:

### Requirement

What business requirement is being implemented.

### Design

Which modules/data/API components are affected.

### Implementation

What was changed.

### Database

Whether a migration was added.

### Testing

What tests were added or executed.

### Risks

Any known limitations, assumptions, or follow-up concerns.

Example:

```text
Requirement:
Add stock adjustment functionality.

Design:
InventoryService + inventory_transactions + admin UI.

Implementation:
- Added POST /api/v1/inventory/adjustments
- Added permission check
- Added transactional stock update
- Added audit logging

Database:
Added Alembic migration.

Testing:
- Adjustment success
- Insufficient stock
- Unauthorized user
- Concurrent update

Risks:
None identified.
```

---

# 42. Final Agent Rule

The most important rule is:

> **Build the Fish POS as one reliable business platform, not as a collection of screens.**

Every implementation must preserve the integrity of:

```text
Products
    ↓
Inventory
    ↓
Sales / Orders
    ↓
Payments
    ↓
Customers
    ↓
Reports
    ↓
Integrations
```

The agent should always ask internally:

```text
Does this change preserve data integrity?
Does it preserve security?
Does it preserve auditability?
Will Phase 2 and Phase 3 be able to reuse it?
Can another developer understand and maintain it?
```

When a simpler design satisfies the requirement without compromising these principles, choose the simpler design.