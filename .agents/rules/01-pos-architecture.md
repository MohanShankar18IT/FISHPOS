# Fish POS — Architecture & Phase Governance

> [!IMPORTANT]
> Fish POS is developed in 3 progressive phases:
> 1. **Phase 1**: Retail POS + Inventory Management (Physical Stores)
> 2. **Phase 2**: Online Sales & Order Fulfillment
> 3. **Phase 3**: Integrations (Payments, Accounting, GST, Weighing Scales, Delivery Providers)

## 1. 3-Tier Layered Architecture

The default system flow is:
```text
React (TypeScript UI)
       ↓  (REST API /api/v1)
FastAPI (Router / Controllers)
       ↓  (Pydantic validation, RBAC)
Service Layer (Authoritative Business Rules & Calculations)
       ↓  (Transactions, Unit of Work)
Repository Layer (SQLAlchemy ORM)
       ↓
PostgreSQL Database
```

## 2. Phase Boundary Discipline

- **Phase 1 (Retail POS & Core Inventory)**:
  - Scope: Fish retail counter sales, Catch weight / unit sales, Real-time stock movement ledger, Purchases & batches, Wastage tracking (cutting loss & spoilage), Daily register shifts & cash drawer balance, Thermal receipt printing, Customer records.
  - Do NOT introduce unneeded online checkout UI elements into the physical POS screen in Phase 1.
  - HOWEVER, data models (Inventory, Products, Orders) MUST support reservation attributes for Phase 2 readiness.
- **Phase 2 (Online Commerce)**:
  - Online catalog, Cart, Online checkout, Order lifecycle (PENDING -> CONFIRMED -> PROCESSING -> READY -> OUT_FOR_DELIVERY -> DELIVERED / CANCELLED).
  - Stock Reservation: Online orders reserve available stock without immediate physical deduction until packing/dispatch.
- **Phase 3 (Integrations & Hardware)**:
  - Weighing scales (RS-232 / USB / WebSerial), Barcode scanners, Payment gateways & UPI QR dynamic generators, Accounting/GST sync, Delivery logistics adapters.

## 3. Single Source of Truth

- The backend (FastAPI + PostgreSQL) is the ONLY authoritative source of truth for:
  - Inventory availability and deduction
  - Final item pricing, cutting charges, discounts, taxes (GST), and grand totals
  - Order and Payment states
- The React frontend handles UI responsiveness, temporary cart state, optimistic previews, and hardware input formatting, but must always submit to backend calculations for final settlement.
