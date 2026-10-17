# Fish POS — Product Requirements & Development Plan

## 1. Document Overview

**Product:** Fish POS (Point of Sale & Commerce Platform)  
**Development Approach:** 3 Phases  
**Frontend:** React.js  
**Backend:** Python FastAPI  
**Database:** PostgreSQL  

### Purpose

Fish POS is a business management and sales platform designed for fish retailers to manage **retail counter sales, inventory, online orders, and integrations**.

The system will be developed incrementally in three phases:

| Phase | Scope | Primary Objective |
|---|---|---|
| **Phase 1** | Retail Sales + Inventory | Build the core POS and inventory management system |
| **Phase 2** | Online Sales | Enable customers to place orders online |
| **Phase 3** | Integration | Connect POS with external systems and automate business processes |

---

# 2. Business Objectives

The Fish POS system should:

1. Enable fast and accurate fish retail billing.
2. Track inventory in real time.
3. Support fish sold by **weight, quantity, and unit**.
4. Track purchase, stock movement, wastage, and adjustments.
5. Provide sales and inventory reports.
6. Provide customer management.
7. Enable online ordering in Phase 2.
8. Synchronize online and physical-store inventory.
9. Provide integration APIs in Phase 3.
10. Provide role-based access and audit tracking.

---

# 3. Technology Architecture

## 3.1 Technology Stack

### Frontend

**React.js**

Recommended supporting technologies:

- React
- React Router
- TypeScript
- React Query / TanStack Query
- Form validation
- Responsive UI
- PWA capability for POS use where appropriate

### Backend

**Python FastAPI**

Recommended components:

- FastAPI
- Pydantic
- SQLAlchemy
- Alembic
- JWT/OAuth-based authentication
- REST APIs
- Background task processing

### Database

**PostgreSQL**

The database will store:

- Products
- Categories
- Inventory
- Purchases
- Sales
- Customers
- Suppliers
- Users
- Orders
- Payments
- Stock movements
- Online orders
- Integration data
- Audit logs

### High-Level Architecture

```text
                    ┌─────────────────────┐
                    │     React Frontend  │
                    │                     │
                    │  POS | Admin | Web  │
                    └──────────┬──────────┘
                               │
                            REST API
                               │
                    ┌──────────▼──────────┐
                    │     FastAPI Backend │
                    │                     │
                    │ Business Logic      │
                    │ Authentication      │
                    │ Inventory           │
                    │ Sales               │
                    │ Orders              │
                    │ Integrations        │
                    └──────────┬──────────┘
                               │
                         SQLAlchemy
                               │
                    ┌──────────▼──────────┐
                    │     PostgreSQL      │
                    │                     │
                    │ Sales               │
                    │ Inventory           │
                    │ Customers           │
                    │ Products            │
                    │ Orders              │
                    └─────────────────────┘
```

---

# 4. User Roles

The system should support configurable role-based access.

### 4.1 Super Admin

- Full system access
- User management
- Configuration
- Reports
- Integration management

### 4.2 Store Manager

- Sales
- Inventory
- Purchasing
- Customers
- Suppliers
- Reports
- Stock adjustments

### 4.3 Cashier

- Create sales
- Process payments
- Print receipts
- View permitted product information
- Process returns subject to permissions

### 4.4 Inventory Manager

- Stock receiving
- Stock transfers
- Stock adjustments
- Wastage
- Inventory reports

### 4.5 Online Order Manager

Primarily required from Phase 2:

- View online orders
- Confirm orders
- Prepare orders
- Update order status
- Handle cancellations/refunds

---

# 5. PHASE 1 — RETAIL SALES + INVENTORY

## 5.1 Objective

Phase 1 will establish the core Fish POS platform for physical retail stores.

The system should allow the store to:

**Purchase → Receive Stock → Maintain Inventory → Sell → Deduct Stock → Track Payment → Report**

---

## 5.2 Product Management

The system should allow administrators to create and manage fish products.

### Product Information

- Product ID / SKU
- Product name
- Product category
- Fish type
- Fresh/Frozen status
- Unit of measurement
- Selling price
- Cost price
- Tax
- Barcode
- Minimum stock level
- Maximum stock level
- Active/inactive status
- Product image
- Description

### Units

The system should support:

- Kilogram
- Gram
- Piece
- Box
- Pack
- Other configurable units

### Weight-Based Products

Fish is commonly sold by weight.

The POS should support:

```text
Product: Seer Fish
Price: ₹800 / KG
Weight: 1.250 KG
Total: ₹1,000
```

The system should support decimal quantities.

---

# 5.3 Category Management

Examples:

- Fresh Fish
- Frozen Fish
- Prawns
- Crabs
- Shellfish
- Ready-to-Cook
- Cleaned & Cut
- Other

Categories should be configurable by administrators.

---

# 5.4 Inventory Management

Inventory is a core feature of Phase 1.

### Stock Transactions

The system should record:

- Opening stock
- Purchase receipt
- Sales deduction
- Sales return
- Purchase return
- Stock adjustment
- Stock transfer
- Wastage
- Damaged stock
- Expired stock

### Inventory Ledger

Each stock movement should contain:

- Date/time
- Product
- Transaction type
- Quantity
- Previous stock
- New stock
- Reference transaction
- User
- Reason, where applicable

Example:

```text
Opening Stock       +50 KG
Purchase            +100 KG
Retail Sale         -12.5 KG
Wastage              -2 KG
Current Stock       135.5 KG
```

---

# 5.5 Purchase Management

The system should support supplier purchases.

### Supplier

Store:

- Supplier name
- Contact person
- Phone
- Email
- Address
- GST/tax information, if applicable
- Payment terms
- Active/inactive status

### Purchase Order

Fields:

- Purchase number
- Supplier
- Date
- Products
- Quantity
- Cost price
- Tax
- Total amount
- Payment status
- Notes

### Goods Receipt

When stock is received:

```text
Purchase Order
      ↓
Goods Received
      ↓
Inventory Increased
      ↓
Purchase Recorded
```

---

# 5.6 Retail POS

The POS screen should be optimized for fast counter sales.

### POS Features

- Product search
- Barcode scanning
- Category filtering
- Product selection
- Weight entry
- Quantity entry
- Price calculation
- Discount
- Tax
- Customer selection
- Payment
- Receipt generation
- Sale cancellation
- Returns

### Example

```text
Seer Fish
1.250 KG × ₹800 = ₹1,000

Prawns
0.750 KG × ₹600 = ₹450

Subtotal              ₹1,450
Discount                 ₹50
Tax                      ₹70
----------------------------
Grand Total            ₹1,470
```

---

# 5.7 Payment Management

Phase 1 should support configurable payment methods.

Examples:

- Cash
- UPI
- Card
- Bank transfer
- Credit
- Multiple payment methods

### Split Payment

Example:

```text
Total: ₹2,000

Cash: ₹500
UPI:  ₹1,500
```

The transaction should be stored as a single sale with multiple payment records.

---

# 5.8 Customer Management

Customer information:

- Customer ID
- Name
- Mobile
- Email
- Address
- Purchase history
- Outstanding balance, if applicable
- Loyalty information — future enhancement

Customer registration should be optional for walk-in sales.

---

# 5.9 Sales Returns

Authorized users should be able to process returns.

Return process:

```text
Original Sale
     ↓
Select Items
     ↓
Enter Return Quantity
     ↓
Return Reason
     ↓
Inventory Updated
     ↓
Refund / Credit
```

---

# 5.10 Wastage Management

Fish inventory requires wastage tracking.

Reasons may include:

- Spoilage
- Damage
- Cleaning loss
- Processing loss
- Expiry
- Other

Wastage should be recorded separately from normal sales.

Reports should show:

- Wastage quantity
- Wastage value
- Product
- Reason
- Date
- User

---

# 5.11 Dashboard

Phase 1 dashboard should provide:

- Today's sales
- Number of transactions
- Cash sales
- Digital sales
- Current inventory value
- Low-stock products
- Wastage
- Today's purchases
- Top-selling products

---

# 5.12 Reports — Phase 1

### Sales Reports

- Daily sales
- Weekly sales
- Monthly sales
- Product-wise sales
- Category-wise sales
- Cashier-wise sales
- Payment-method sales
- Tax report
- Discount report

### Inventory Reports

- Current stock
- Stock valuation
- Stock movement
- Low-stock report
- Wastage report
- Stock adjustment report

### Purchase Reports

- Supplier-wise purchases
- Product-wise purchases
- Purchase summary
- Outstanding supplier payments

---

# 6. PHASE 2 — ONLINE SALES

## 6.1 Objective

Phase 2 will extend the Fish POS system into an online commerce platform.

Customers should be able to:

```text
Browse Products
      ↓
Add to Cart
      ↓
Checkout
      ↓
Payment
      ↓
Order Created
      ↓
Store Prepares Order
      ↓
Pickup / Delivery
      ↓
Order Completed
```

---

# 6.2 Online Store

The React application should provide a customer-facing web interface.

### Features

- Product catalog
- Product images
- Product details
- Prices
- Availability
- Search
- Categories
- Cart
- Checkout
- Customer registration/login
- Address management
- Order history

---

# 6.3 Online Product Catalog

Products from the POS should be selectively published online.

Each product should have:

- Online enabled/disabled
- Online name
- Online description
- Online image
- Online price
- Available quantity
- Minimum order quantity
- Maximum order quantity

---

# 6.4 Shopping Cart

Customer can:

- Add products
- Change quantity/weight
- Remove products
- View subtotal
- Apply coupons, if enabled
- View delivery charges
- View tax
- View total

---

# 6.5 Online Ordering

Order statuses:

```text
PENDING
   ↓
CONFIRMED
   ↓
PROCESSING
   ↓
READY
   ↓
OUT_FOR_DELIVERY
   ↓
DELIVERED
```

Alternative statuses:

```text
CANCELLED
REFUNDED
FAILED
```

---

# 6.6 Online Payment

The payment architecture should be designed so that a payment gateway can be added without changing the core order model.

Possible methods:

- UPI
- Card
- Net banking
- Wallet
- Cash on Delivery, if required

Payment status:

- Pending
- Authorized
- Paid
- Failed
- Refunded
- Partially refunded

---

# 6.7 Delivery Management

Phase 2 should support:

- Customer address
- Delivery zone
- Delivery charge
- Delivery slot
- Order preparation time
- Delivery status

The initial version can use manual delivery assignment.

External delivery integration can be handled in Phase 3.

---

# 6.8 Online Inventory Synchronization

Online inventory must use the same inventory source as the retail POS.

Example:

```text
Available Stock = 50 KG

Retail Sale       -5 KG
Online Sale       -3 KG
------------------------
Available Stock = 42 KG
```

The system must prevent overselling through appropriate stock reservation and transaction handling.

---

# 6.9 Customer Accounts

Customers should be able to:

- Register
- Login
- Manage profile
- Manage addresses
- View orders
- Reorder
- View invoices
- Track order status

---

# 6.10 Coupons and Promotions

Phase 2 may support:

- Percentage discount
- Fixed amount discount
- Product-specific discount
- Category discount
- Minimum-order discount
- Coupon codes
- Date-based promotions

---

# 6.11 Online Reports

- Online sales
- Online orders
- Cancelled orders
- Refunds
- Online payment report
- Delivery report
- Customer sales
- Product performance

---

# 7. PHASE 3 — INTEGRATION

## 7.1 Objective

Phase 3 will connect Fish POS with external systems and services.

The integration layer should be API-first and loosely coupled.

---

# 7.2 Integration Architecture

```text
                         Fish POS
                            │
                     Integration API
                            │
          ┌─────────────────┼──────────────────┐
          │                 │                  │
     Payment Gateway    Accounting          Delivery
          │              System               │
          │                 │                  │
       Payments         Finance            Logistics
```

---

# 7.3 Payment Gateway Integration

Integrate with selected payment providers.

Requirements:

- Payment initiation
- Payment callback/webhook
- Payment verification
- Refund
- Transaction status
- Failed payment handling
- Reconciliation

The backend must validate payment gateway callbacks rather than trusting client-side payment status.

---

# 7.4 Accounting Integration

Potential accounting integrations:

- Sales invoices
- Purchase invoices
- Tax information
- Customer balances
- Supplier balances
- Payments
- Refunds

Integration should support scheduled synchronization and/or real-time APIs depending on the external platform.

---

# 7.5 Delivery Integration

Integration with third-party delivery services should support:

- Delivery request
- Pickup request
- Delivery assignment
- Driver information
- Tracking
- Delivery status
- Cancellation
- Delivery charges

---

# 7.6 Messaging Integration

Possible integrations:

- SMS
- Email
- WhatsApp

Notifications:

- Order confirmation
- Payment confirmation
- Order ready
- Delivery started
- Order delivered
- Cancellation
- Refund

---

# 7.7 Barcode / Hardware Integration

The system should be designed for integration with:

- Barcode scanners
- Receipt printers
- Weighing scales
- Cash drawers
- Customer displays

Hardware integration should be isolated from core business logic so that hardware can be changed without rewriting the POS.

---

# 7.8 External API

Fish POS should expose secured REST APIs for approved third-party applications.

Example API groups:

```text
/api/v1/auth
/api/v1/products
/api/v1/categories
/api/v1/inventory
/api/v1/purchases
/api/v1/sales
/api/v1/customers
/api/v1/orders
/api/v1/payments
/api/v1/delivery
/api/v1/integrations
/api/v1/reports
```

API versioning should be used from the beginning.

---

# 8. CORE DATABASE DESIGN

The database should be normalized while allowing high-volume transactional operations.

### Core Tables

```text
users
roles
permissions
stores
terminals

products
product_categories
product_units
product_prices

suppliers
purchase_orders
purchase_items
goods_receipts
goods_receipt_items

inventory
inventory_transactions
stock_adjustments
wastage

customers
customer_addresses

sales
sale_items
sale_payments
sales_returns
sales_return_items

online_orders
online_order_items
order_status_history

payments
refunds

coupons
promotions

delivery_orders

integrations
integration_logs
webhook_events

audit_logs
```

---

# 9. IMPORTANT INVENTORY DESIGN

Inventory should be implemented as a transaction-based system rather than simply updating one quantity field.

### Inventory Transaction Example

```text
inventory_transactions

id
product_id
store_id
transaction_type
quantity
unit_cost
reference_type
reference_id
created_by
created_at
```

Transaction types:

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

This provides a complete audit trail.

---

# 10. API REQUIREMENTS

The FastAPI backend should provide RESTful APIs.

### Authentication

```text
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### Products

```text
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/{id}
PUT    /api/v1/products/{id}
DELETE /api/v1/products/{id}
```

### Inventory

```text
GET  /api/v1/inventory
GET  /api/v1/inventory/{product_id}
POST /api/v1/inventory/adjustment
GET  /api/v1/inventory/transactions
```

### Sales

```text
POST /api/v1/sales
GET  /api/v1/sales
GET  /api/v1/sales/{id}
POST /api/v1/sales/{id}/return
```

### Online Orders

```text
POST /api/v1/orders
GET  /api/v1/orders
GET  /api/v1/orders/{id}
PUT  /api/v1/orders/{id}/status
POST /api/v1/orders/{id}/cancel
```

---

# 11. NON-FUNCTIONAL REQUIREMENTS

## Performance

- POS transactions should respond quickly under normal operating conditions.
- Product search should be optimized for large product catalogs.
- Inventory transactions must be atomic.
- Concurrent sales must not create negative stock unintentionally.
- APIs should support pagination.

## Security

- JWT/OAuth-based authentication
- Role-based authorization
- Password hashing
- HTTPS
- Input validation
- SQL injection protection through ORM/parameterized queries
- Audit logging
- Secure webhook validation
- Rate limiting for public APIs
- Secure secrets management

## Reliability

- Database backup
- Transaction rollback
- Error logging
- API monitoring
- Health-check endpoints
- Failed integration retry mechanism

## Scalability

The architecture should support:

- Multiple stores
- Multiple POS terminals
- Multiple warehouses
- Multiple users
- Increasing online orders
- Future mobile applications

---

# 12. MULTI-STORE READINESS

Although the initial deployment may be for one store, the database should include `store_id` where appropriate.

Future architecture:

```text
                    Fish POS
                       │
       ┌───────────────┼───────────────┐
       │               │               │
    Store 1         Store 2         Store 3
       │               │               │
      POS             POS             POS
       │               │               │
       └───────────────┼───────────────┘
                       │
                  Central DB
```

This avoids major architectural changes when additional stores are introduced.

---

# 13. AUDIT LOGGING

Important actions should be logged.

Examples:

- Login
- Product creation/update
- Price change
- Inventory adjustment
- Sale cancellation
- Refund
- Purchase modification
- User creation
- Permission change
- Integration configuration

Audit log:

```text
User
Action
Entity
Entity ID
Old Value
New Value
Timestamp
IP Address
```

---

# 14. DEVELOPMENT PLAN

## Phase 1 — Retail + Inventory

### Sprint Group 1 — Foundation

- [ ] Project setup
- [ ] React application
- [ ] FastAPI application
- [ ] PostgreSQL setup
- [ ] Database migrations
- [ ] Authentication
- [ ] Role/permission framework
- [ ] Common UI components
- [ ] API standards

### Sprint Group 2 — Master Data

- [ ] Product management
- [ ] Category management
- [ ] Unit management
- [ ] Pricing
- [ ] Supplier management
- [ ] Customer management

### Sprint Group 3 — Inventory

- [ ] Opening stock
- [ ] Purchase management
- [ ] Goods receipt
- [ ] Stock ledger
- [ ] Stock adjustment
- [ ] Wastage
- [ ] Low-stock alerts

### Sprint Group 4 — POS

- [ ] POS screen
- [ ] Product search
- [ ] Barcode support
- [ ] Weight-based selling
- [ ] Cart
- [ ] Discounts
- [ ] Tax
- [ ] Payments
- [ ] Receipt
- [ ] Sales return

### Sprint Group 5 — Reporting

- [ ] Sales dashboard
- [ ] Sales reports
- [ ] Inventory reports
- [ ] Purchase reports
- [ ] Payment reports
- [ ] Wastage reports

### Phase 1 Deliverable

A complete **physical-store Fish POS with inventory management**.

---

# 15. PHASE 2 DEVELOPMENT

### Sprint Group 1 — Online Store

- [ ] Customer website
- [ ] Product catalog
- [ ] Search
- [ ] Categories
- [ ] Product details
- [ ] Customer registration
- [ ] Login

### Sprint Group 2 — Shopping

- [ ] Cart
- [ ] Checkout
- [ ] Address management
- [ ] Delivery zones
- [ ] Delivery charges
- [ ] Order creation

### Sprint Group 3 — Online Order Management

- [ ] Order dashboard
- [ ] Order confirmation
- [ ] Order preparation
- [ ] Order status
- [ ] Cancellation
- [ ] Refund

### Sprint Group 4 — Payments

- [ ] Payment gateway
- [ ] Payment callback
- [ ] Payment verification
- [ ] Refund processing

### Sprint Group 5 — Inventory Synchronization

- [ ] Online stock availability
- [ ] Stock reservation
- [ ] Stock release
- [ ] Retail/online synchronization
- [ ] Overselling prevention

### Phase 2 Deliverable

A complete **Fish POS + Online Ordering Platform** using the same core product, customer, sales, and inventory platform.

---

# 16. PHASE 3 DEVELOPMENT

### Integration Sprint Group

- [ ] Payment gateway integrations
- [ ] Accounting integration
- [ ] Tax/GST integration where required
- [ ] Delivery integration
- [ ] SMS integration
- [ ] Email integration
- [ ] WhatsApp integration
- [ ] Barcode hardware integration
- [ ] Weighing-scale integration
- [ ] Receipt printer integration
- [ ] External API
- [ ] Webhook framework
- [ ] Integration monitoring
- [ ] Retry mechanism
- [ ] Reconciliation

### Phase 3 Deliverable

A connected **Fish Commerce & Business Management Platform**.

---

# 17. TESTING REQUIREMENTS

Testing should be included in every phase.

### Unit Testing

Backend business logic and frontend components.

### API Testing

All FastAPI endpoints should be tested for:

- Valid requests
- Invalid requests
- Authentication
- Authorization
- Error responses

### Integration Testing

Test:

```text
POS → Inventory
Purchase → Inventory
Sale → Inventory
Online Order → Inventory
Payment → Order
Return → Inventory
Refund → Payment
```

### End-to-End Testing

Important scenarios:

1. Create product.
2. Receive stock.
3. Sell product.
4. Verify inventory deduction.
5. Process return.
6. Verify inventory increase.
7. Create online order.
8. Reserve inventory.
9. Complete payment.
10. Complete delivery.
11. Verify final inventory and financial records.

---

# 18. DEPLOYMENT ARCHITECTURE

Recommended production architecture:

```text
                    Internet
                       │
                 Load Balancer
                       │
             ┌─────────┴─────────┐
             │                   │
        React Frontend      FastAPI API
                                  │
                           ┌──────┴──────┐
                           │             │
                       PostgreSQL      Redis*
                           │
                       Backup/Storage

* Redis can be introduced when caching,
  background jobs, sessions, or queues
  require it.
```

Containerization with Docker is recommended.

---

# 19. BACKUP & DISASTER RECOVERY

The system should implement:

- Automated PostgreSQL backups
- Backup retention policy
- Database recovery testing
- Application logs
- Error monitoring
- Disaster recovery procedure

---

# 20. PHASE-WISE SCOPE SUMMARY

| Capability | Phase 1 | Phase 2 | Phase 3 |
|---|:---:|:---:|:---:|
| Product Management | ✓ | ✓ | ✓ |
| Supplier Management | ✓ | ✓ | ✓ |
| Customer Management | ✓ | ✓ | ✓ |
| Retail POS | ✓ | ✓ | ✓ |
| Inventory | ✓ | ✓ | ✓ |
| Purchasing | ✓ | ✓ | ✓ |
| Wastage | ✓ | ✓ | ✓ |
| Sales Returns | ✓ | ✓ | ✓ |
| Reports | ✓ | ✓ | ✓ |
| Online Store | | ✓ | ✓ |
| Shopping Cart | | ✓ | ✓ |
| Online Orders | | ✓ | ✓ |
| Online Payments | | ✓ | ✓ |
| Delivery Management | | ✓ | ✓ |
| Stock Reservation | | ✓ | ✓ |
| Payment Integration | | Basic | Advanced |
| Accounting Integration | | | ✓ |
| Delivery Provider Integration | | | ✓ |
| SMS/Email/WhatsApp | | Basic | ✓ |
| Hardware Integration | | | ✓ |
| External APIs | | | ✓ |
| Webhooks | | | ✓ |
| Multi-store Readiness | ✓ | ✓ | ✓ |

---

# 21. KEY BUSINESS RULES

1. Inventory cannot be reduced without an identifiable stock transaction.
2. Every sale must generate corresponding inventory transactions.
3. Every return must reverse the appropriate inventory movement.
4. Wastage must be separately identifiable from sales.
5. Online orders must reserve stock before final fulfillment.
6. Inventory updates must be transactional and concurrency-safe.
7. Product prices must maintain an audit trail when changed.
8. Cancelled orders must release reserved inventory.
9. Refunds must be associated with the original payment/order.
10. Only authorized users can perform stock adjustments, refunds, and cancellations.
11. All critical financial and inventory operations must be auditable.
12. The system should support decimal quantities for weight-based products.
13. POS and online sales must use the same central inventory model.
14. API versioning should be implemented from the first release.

---

# 22. MVP DEFINITION

The **Phase 1 MVP** is considered complete when a store can perform the complete operational cycle:

```text
Supplier
   ↓
Purchase
   ↓
Goods Receipt
   ↓
Inventory
   ↓
Retail POS Sale
   ↓
Payment
   ↓
Receipt
   ↓
Inventory Deduction
   ↓
Sales / Inventory Reports
```

The **Phase 2 MVP** adds:

```text
Customer
   ↓
Online Store
   ↓
Cart
   ↓
Checkout
   ↓
Payment
   ↓
Online Order
   ↓
Stock Reservation
   ↓
Store Fulfillment
   ↓
Delivery / Pickup
```

The **Phase 3 MVP** adds external business-system connectivity:

```text
Fish POS
   │
   ├── Payment Gateway
   ├── Accounting
   ├── Tax/GST
   ├── Delivery
   ├── SMS
   ├── Email / WhatsApp
   ├── Hardware
   └── External APIs
```

# 23. Recommended Development Principle

The three phases should **not be developed as three separate applications**.

Instead, build one modular platform:

```text
                FISH POS PLATFORM
                       │
        ┌──────────────┼──────────────┐
        │              │              │
     Retail          Online       Integration
       POS             Sales          Layer
        │              │              │
        └──────────────┼──────────────┘
                       │
                Shared Services
                       │
          ┌────────────┼────────────┐
          │            │            │
       Products    Inventory     Customers
          │            │            │
          └────────────┼────────────┘
                       │
                  PostgreSQL
```

This architecture allows Phase 2 and Phase 3 to reuse the Phase 1 product, inventory, customer, payment, and order foundations rather than rebuilding them.

**Final Technology Stack**

- **Frontend:** React + TypeScript
- **Backend:** Python + FastAPI
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Migrations:** Alembic
- **Authentication:** JWT/OAuth
- **API:** REST API with versioning
- **Deployment:** Docker-based deployment
- **Architecture:** Modular monolith initially, with integration-ready boundaries
- **Development:** Phase 1 → Retail & Inventory → Phase 2 → Online Sales → Phase 3 → Integrations