---
name: pos-feature-plan
description: >-
  Creates a comprehensive feature specification and implementation plan for Fish POS (Phase 1, 2, or 3).
  Activate this skill when planning new retail POS, online order, inventory ledger, or hardware integration features.
---

# Fish POS — Feature Planning Skill

This skill standardizes the planning and design process for new features in the **Fish POS** application.

## Workflow

1. **Identify Phase Scope**:
   - **Phase 1**: Retail POS Counter, Catch Weight Sales, Shift Drawer, Wastage & Batches.
   - **Phase 2**: Online Commerce, Stock Reservations, Packing & Delivery.
   - **Phase 3**: Weighing Scale / Hardware, Payment Gateways, Delivery Partner APIs, GST Accounting.

2. **Authoritative Source of Truth**:
   - Ensure calculations (weights, taxes, totals, stock levels) reside authoritatively on the FastAPI backend.
   - Frontend React UI handles input acceleration, tactile feedback, and optimistic state.

3. **Check Database & Transaction Requirements**:
   - Every inventory deduction or addition must log an explicit `InventoryMovement`.
   - All multi-table mutations (Sale + SaleItem + Payment + InventoryMovement) require an atomic database transaction.
