# Fish POS — Backend Guidelines (FastAPI & Python)

## 1. Directory & Layer Organization

All backend code must reside in `BACKEND/app/` following strict layering:
- `api/v1/endpoints/`: Thin controllers orchestrating HTTP requests, receiving Pydantic models, and invoking services.
- `core/`: Application settings (`pydantic-settings`), database connections, security (JWT, hashing), and dependency injection helpers.
- `models/`: SQLAlchemy ORM entity models mapping to PostgreSQL tables.
- `schemas/`: Pydantic models for request validation, data serialization, and API response contracts.
- `services/`: Encapsulated business logic (e.g. `SaleService`, `InventoryService`, `PricingService`, `OnlineOrderService`).
- `repositories/`: Database interaction queries and CRUD abstractions.

## 2. API Design & Versioning

- All endpoints MUST be prefixed with `/api/v1/`.
- Use standard REST conventions:
  - `GET /api/v1/products`: List products
  - `POST /api/v1/products`: Create product
  - `GET /api/v1/products/{id}`: Product details
  - `POST /api/v1/sales`: Checkout a sale atomically
  - `POST /api/v1/inventory/movements`: Record stock ledger movement
- Never use verb-heavy non-REST paths like `/createSaleNow` or `/doStockAdjustment`.

## 3. Transactions & Data Integrity

- Atomic Operations: Any operation that creates a sale, updates inventory, creates a payment record, or logs audit entries MUST run inside a single database transaction.
- Rollback on Error: If any step fails (e.g., insufficient stock or payment failure), rollback completely without leaving orphaned records.

## 4. Error Handling & Standard Responses

- Standard error envelope:
```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Available stock for Seer Fish is 1.250 kg, requested 2.000 kg",
    "details": {
      "product_id": "prod_123",
      "available_stock": 1.250,
      "requested_stock": 2.000
    }
  }
}
```
- Never expose raw database exceptions or internal stack traces to clients.

## 5. Authentication & Authorization (RBAC)

- Use JWT authentication with bearer tokens.
- Role checks must be enforced in dependencies (`get_current_active_user`, `require_roles(["super_admin", "store_manager", "cashier"])`).
- Least privilege: Cashiers can create sales and accept payments, but cannot modify prices, adjust raw stock, or void completed sales without manager override.
