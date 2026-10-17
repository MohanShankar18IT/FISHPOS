# Fish POS — Frontend Guidelines (React & TypeScript)

## 1. Stack & Architecture

- **Framework**: React with TypeScript (strict mode, no `any` unless explicitly justified).
- **Directory Structure**:
  - `src/components/pos/`: POS counter components (ProductGrid, WeightModal, CartSidebar, PaymentModal, ReceiptModal, HoldOrdersModal).
  - `src/components/online/`: Online order Kanban & status transitions.
  - `src/components/inventory/`: Stock tracking, fresh catch batch intake, wastage logging.
  - `src/components/layout/`: Top navigation, register status, shift tracker, sidebar.
  - `src/services/`: Centralized API client (`api.ts`) and mock fallback layer.
  - `src/context/`: Local UI & Cart state management.
  - `src/types/`: Complete TypeScript domain definitions.

## 2. POS User Experience & Interaction Rules

- **High-Velocity Operational Workflow**:
  - Touch-screen friendly with large clickable targets.
  - Keyboard shortcuts for rapid cashier operation (`F2` for search, `F8` for hold sale, `Space`/`Enter` for quick cash pay, `Esc` to cancel modal).
  - Instant search filtering by fish name, local name (e.g. Vanjaram / Seer Fish), and SKU/barcode.
- **Weight & Cut Handling**:
  - Fish sold by weight (kg with 3 decimal precision e.g. `1.250 kg`) or unit/piece.
  - Dedicated cut selection modal: Whole, Curry Cut, Steaks, Fillet, Cleaned/Gutted, Head Only.
  - Tare weight support for container/ice deductions.
- **Cart & Totals**:
  - Live calculations for item subtotal, item-level discounts, GST/tax, round-off, and grand total.
  - Quick action buttons: Hold sale (with count badge), Void sale, Change quantity/weight.
- **Payment & Receipts**:
  - Multi-payment support: Cash (with quick denominations ₹500, ₹200, ₹100, exact change calculator), UPI QR code display, Card, Split.
  - Thermal receipt printing format (58mm / 80mm standard).

## 3. Formatting Standards

- **Currency**: Display with standard symbol (e.g. `₹1,250.00` or `1,250.00`) formatted to 2 decimal places.
- **Weight**: Always format to 3 decimal places for KG (e.g. `0.750 kg`, `1.500 kg`) or integers for PIECE (`2 pcs`).
- **Dates & Times**: Standard localized 12-hour format with AM/PM for shift receipts.
