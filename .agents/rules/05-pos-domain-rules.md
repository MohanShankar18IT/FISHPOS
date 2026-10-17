# Fish POS — Domain & Business Rules

## 1. Fish Inventory & Catch Weight Rules

- **Catch Weight Pricing**:
  - Fish is variable-weight inventory. Items are priced per standard unit (e.g. ₹800 / kg).
  - Final item price = `ROUND((Weight_KG * Unit_Price) - Discount + Tax, 2)`.
  - When weighing, allow tare deduction (container/ice box weight).
- **Cut Types & Customization**:
  - Available cuts: `Whole (Uncleaned)`, `Cleaned & Gutted`, `Curry Cut`, `Steaks / Slices`, `Fillet / Boneless`, `Head & Tail Separate`.
  - Optional cutting fee or cleaning loss factor can be recorded per cut type.
- **Wastage & Loss Tracking**:
  - Wastage types: `SPOILAGE`, `CUTTING_LOSS`, `ICE_MELT`, `EXPIRED`.
  - Every wastage entry must document the weight, reason, and approving manager.

## 2. Shift & Cash Drawer Lifecycle

- **Opening Shift**: Cashier enters opening float (e.g. ₹2,000 cash).
- **Transactions During Shift**: System tracks Cash In, Cash Out, Card totals, and UPI totals.
- **Closing Shift**: Cashier counts physical cash; system calculates expected vs actual discrepancy (overage / shortage) and freezes shift audit record.

## 3. Online Order Reservation vs Physical Stock

- **Inventory Buckets**:
  - `Physical Stock`: Total actual fish inventory in the store chiller.
  - `Reserved Stock`: Allocated for pending online orders not yet packed.
  - `Available Stock` = `Physical Stock - Reserved Stock`.
- **Order Lifecycle**:
  - `PENDING`: Order received, stock reserved (`RESERVATION` movement).
  - `CONFIRMED` / `PROCESSING`: Store prepares and cuts the fish.
  - `READY`: Packed and ready for dispatch.
  - `DELIVERED`: Physical stock deducted, reservation cleared (`SALE` movement).
  - `CANCELLED`: Reservation released back to available stock (`RELEASE` movement).

## 4. Payment Idempotency

- All checkout and payment mutation requests accept an `Idempotency-Key` header or sale UUID to prevent double charges on network dropouts.
