# Fish POS — Frontend Application (React + TypeScript)

Ultra-fast, touch and keyboard-optimized Point of Sale & Omnichannel Fulfillment interface built for fresh seafood retail outlets.

## Key Features

1. **Counter POS Screen**:
   - Live catch weight calculation with tare tray deduction.
   - Fish cut type selection: `Whole`, `Curry Cut`, `Steaks / Slices`, `Fillet (Boneless)`, `Cleaned & Gutted`.
   - Real-time cart calculations (Tax, discounts, rounding off).
   - Fast checkout with multiple payment methods: Cash with instant change calculator, Dynamic UPI QR Code, Card Terminal, Split payments.
   - 80mm thermal receipt generator with store details and itemized weights.
   - Cart suspension (`Hold Sale`) and instant queue recall.

2. **Online Orders Fulfillment Board (Phase 2 Preview)**:
   - Real-time Kanban board: `Incoming / Pending`, `Cutting & Preparing`, `Packed in Chiller`, `Out for Delivery`, `Delivered`.
   - Dedicated stock reservation tags to prevent overselling.

3. **Fresh Catch & Real-Time Stock Ledger**:
   - Stock monitor displaying physical vs reserved vs available inventory.
   - Fresh catch lot receiving form (Landing Port origin, Net weight, Cost/KG).
   - Wastage and cutting loss deduction logger with mandatory audit reasons.

4. **Register Shift & Day-End Balancing**:
   - Opening cash float management.
   - Breakdown of collections across Cash, UPI, and Card.
   - Blind cash count reconciliation (Overage / Shortage detection) and Shift closing report.

---

## Running Locally

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The application will be accessible at: [http://localhost:5173](http://localhost:5173)
