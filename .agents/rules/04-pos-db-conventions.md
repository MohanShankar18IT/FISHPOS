# Fish POS — Database Conventions (PostgreSQL & SQLAlchemy)

## 1. Naming & Type Conventions

- **Tables**: `snake_case` plural nouns (e.g. `products`, `categories`, `inventory_items`, `inventory_movements`, `sales`, `sale_items`, `payments`, `online_orders`, `online_order_items`, `shifts`, `audit_logs`).
- **Columns**: `snake_case` (e.g. `product_id`, `created_at`, `unit_price`, `weight_kg`, `total_amount`).
- **Numeric Precision**:
  - Quantities & Weights: `NUMERIC(12, 3)` (e.g. `999999999.999` kg).
  - Monetary values (Prices, Taxes, Discounts, Totals): `NUMERIC(12, 2)`.
  - NEVER use `FLOAT` or `REAL` for financial or inventory quantities.

## 2. Inventory Ledger Model

- **No Silent Updates**: Never simply update `stock = stock - x` without logging an immutable transaction in `inventory_movements`.
- **Movement Fields**:
  - `id`: UUID / BigInteger primary key
  - `product_id`: FK to products
  - `store_id`: FK to stores
  - `batch_id`: Optional FK to batch_lots
  - `movement_type`: Enum (`OPENING`, `PURCHASE`, `SALE`, `SALE_RETURN`, `PURCHASE_RETURN`, `ADJUSTMENT`, `TRANSFER_IN`, `TRANSFER_OUT`, `WASTAGE`, `RESERVATION`, `RELEASE`)
  - `quantity`: Numeric (positive for additions, negative for deductions)
  - `reference_id`: Associated Sale ID, Purchase ID, or Online Order ID
  - `user_id`: Actor who performed the action
  - `notes`: Description/reason (mandatory for adjustments and wastage)
  - `created_at`: Timestamp UTC

## 3. Database Indexes

- Primary keys: `id` (UUID / BIGSERIAL)
- Foreign keys: all relationship columns indexed
- Search & Lookup indexes:
  - `products(sku)`, `products(barcode)`, `products(name)`
  - `sales(sale_number)`, `sales(created_at)`, `sales(store_id)`
  - `online_orders(order_number)`, `online_orders(status)`
  - `inventory(product_id, store_id)` (Unique constraint + index)

## 4. Migrations

- All database schema modifications must be scripted and tracked via **Alembic**.
- Migration scripts should have upgrade and downgrade paths.
