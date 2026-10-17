# Fish POS — Project Guidelines & Agentic Rules

## 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**
- Understand the 3 development phases:
  - **Phase 1**: Retail POS + Core Inventory Management (Physical store sales, catch weights, cash drawer, thermal receipts)
  - **Phase 2**: Online Sales & Omnichannel Order Fulfillment (Stock reservation, packing workflow)
  - **Phase 3**: Integrations (Weighing scales, Barcode scanners, Payment gateways, Delivery partners, Accounting/GST)
- Keep business logic authoritative on the backend (FastAPI + PostgreSQL). Frontend (React + TypeScript) manages UI state, rapid input, and optimistic display.

## 2. Surgical Changes
**Touch only what you must. Clean up only your own mess.**
- Do not introduce unnecessary dependencies or microservices without requirements.
- Follow established naming conventions: `snake_case` in Python/SQL, `camelCase`/`PascalCase` in React TypeScript.
- Maintain decimal precision: `NUMERIC(12, 3)` for weights/quantities, `NUMERIC(12, 2)` for prices and totals. Never use floating-point types for money or stock.

---

## 3. Technology Stack & Directory Guardrails

### Backend (`BACKEND/`)
- **Framework**: Python 3.11+ / FastAPI
- **ORM & DB**: SQLAlchemy + PostgreSQL (Alembic for migrations)
- **Validation**: Pydantic v2 schemas separated from ORM models
- **Structure**:
  - `app/api/v1/`: Versioned REST endpoints
  - `app/core/`: Config, database connection, security, dependencies
  - `app/models/`: SQLAlchemy ORM models
  - `app/schemas/`: Pydantic request/response schemas
  - `app/services/`: Authoritative business logic (SaleService, InventoryService, OnlineOrderService, PricingService)
  - `app/repositories/`: Data access layer

### Frontend (`FRONTEND/`)
- **Framework**: React 18+ / TypeScript / Vite
- **Styling**: Modern, responsive, touch & keyboard-optimized POS theme with dark/light mode and high-contrast support
- **State & Data**: TanStack Query / React Context for cart and shift state, structured API client with mock fallback
- **Structure**:
  - `src/components/pos/`: Counter POS screens (ProductGrid, WeightModal, CartSidebar, PaymentModal, ReceiptModal, HoldOrdersModal)
  - `src/components/online/`: Online Orders Kanban board & fulfillment status
  - `src/components/inventory/`: Real-time stock monitor, fresh catch batch intake, wastage logging
  - `src/components/layout/`: Navigation bar, store status, cash drawer indicator, shift stats
  - `src/types/`: Domain TypeScript types

---

## 4. Rule Index in `.agents/rules/`

- [.agents/rules/01-pos-architecture.md](file:///d:/PROJECTS/POS/.agents/rules/01-pos-architecture.md) — 3-Tier Layered Architecture & Phase Governance
- [.agents/rules/02-pos-backend-fastapi.md](file:///d:/PROJECTS/POS/.agents/rules/02-pos-backend-fastapi.md) — FastAPI, Pydantic, RBAC & Transactions
- [.agents/rules/03-pos-frontend-react.md](file:///d:/PROJECTS/POS/.agents/rules/03-pos-frontend-react.md) — React TypeScript, POS UX, Touch/Keyboard Workflows
- [.agents/rules/04-pos-db-conventions.md](file:///d:/PROJECTS/POS/.agents/rules/04-pos-db-conventions.md) — PostgreSQL Schema, Decimal Precisions, Stock Ledger
- [.agents/rules/05-pos-domain-rules.md](file:///d:/PROJECTS/POS/.agents/rules/05-pos-domain-rules.md) — Catch Weight, Cutting Loss, Stock Reservation, Payments

---

## 5. Master Specification Documents

- [Fish POS — Product Requirements & Development Plan.md](file:///d:/PROJECTS/POS/Fish%20POS%20%E2%80%94%20Product%20Requirements%20&%20Development%20Plan.md)
- [Fish POS — AI Development Agent Guidelines.md](file:///d:/PROJECTS/POS/Fish%20POS%20%E2%80%94%20AI%20Development%20Agent%20Guidelines.md)
