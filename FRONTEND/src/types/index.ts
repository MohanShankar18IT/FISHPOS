export type UnitType = 'KG' | 'GRAMS' | 'PIECE' | 'PACKET';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'STORE_MANAGER'
  | 'CASHIER'
  | 'INVENTORY_MANAGER'
  | 'ONLINE_ORDER_MANAGER';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
}

export interface PermissionItem {
  id: string;
  module: string;
  action: string;
  name: string;
  description?: string;
  key: string;
}

export interface RolePermissionsMatrix {
  roles: UserRole[];
  permissions: PermissionItem[];
  matrix: Record<UserRole, Record<string, boolean>>;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  local_name?: string;
  scientific_name?: string;
  category_id: string;
  category_name?: string;
  unit_type: UnitType;
  selling_price: number;
  cost_price: number;
  tax_rate: number;
  cut_options: string[];
  min_stock_alert: number;
  is_online_listed: boolean;
  image_url?: string;
  current_stock: number;
  is_active: boolean;
}

export interface ProductPriceHistoryRecord {
  id: string;
  product_id: string;
  old_selling_price: number;
  new_selling_price: number;
  changed_by?: string;
  changed_at: string;
  reason?: string;
}

export interface BulkPriceUpdatePayload {
  items: {
    product_id: string;
    new_selling_price: number;
  }[];
  reason?: string;
}

export interface CartItem {
  id: string; // Unique cart line ID
  productId: string;
  name: string;
  localName?: string;
  imageUrl?: string;
  sku: string;
  cutType: string;
  unitType: UnitType;
  weightKg: number; // e.g. 1.250
  unitPrice: number; // price per KG
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
}

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'SPLIT';

export interface PaymentItem {
  method: PaymentMethod;
  amount: number;
  tenderedAmount?: number;
  changeDue?: number;
  transactionRef?: string;
}

export interface Sale {
  id: string;
  saleNumber: string;
  storeId: string;
  shiftId: string;
  cashierName: string;
  customerName?: string;
  customerPhone?: string;
  status: 'COMPLETED' | 'HELD' | 'VOIDED';
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  roundOff: number;
  grandTotal: number;
  items: CartItem[];
  payments: PaymentItem[];
  notes?: string;
  createdAt: string;
}

export type OnlineOrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface CustomerAccount {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyalty_points?: number;
  total_spent?: number;
  created_at?: string;
}

export interface CustomerCartItem {
  id: string;
  productId: string;
  productName: string;
  localName?: string;
  imageUrl?: string;
  cutType: string;
  weightKg: number;
  unitPrice: number;
  subtotal: number;
  cookingRecommendation?: string;
  specialNotes?: string;
}

export interface OnlineOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryType: 'HOME_DELIVERY' | 'STORE_PICKUP';
  deliveryAddress?: string;
  deliverySlot?: string;
  specialInstructions?: string;
  paymentMethod?: string;
  status: OnlineOrderStatus;
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  grandTotal: number;
  isPaid: boolean;
  items: {
    productId: string;
    productName: string;
    cutType: string;
    requestedWeightKg: number;
    actualWeightKg?: number;
    unitPrice: number;
    subtotal: number;
  }[];
  createdAt: string;
}

export interface ShiftInfo {
  id: string;
  storeId: string;
  cashierId: string;
  cashierName: string;
  registerNumber: string;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
  openingCash: number;
  expectedCash: number;
  actualCash?: number;
  cashDifference?: number;
  totalSalesAmount: number;
  cashSalesAmount: number;
  cardSalesAmount: number;
  upiSalesAmount: number;
  totalTransactions: number;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  categoryName: string;
  physicalStock: number;
  reservedStock: number;
  availableStock: number;
  minStockAlert: number;
  unitPrice: number;
  updatedAt: string;
}

// ----------------------------------------------------
// Reports & Analytics Interfaces
// ----------------------------------------------------

export interface SalesReportSummary {
  storeId: string;
  dateRange: { startDate?: string; endDate?: string };
  grossSales: number;
  netSales: number;
  totalTax: number;
  totalDiscount: number;
  transactionCount: number;
  averageBasketSize: number;
  paymentBreakdown: {
    cash: number;
    upi: number;
    card: number;
    total: number;
  };
  topProducts: {
    productId: string;
    productName: string;
    weightKg: number;
    revenue: number;
    orderCount: number;
  }[];
  hourlySales: {
    hour: number;
    salesCount: number;
    revenue: number;
  }[];
}

export interface SalesRegisterItem {
  id: string;
  saleNumber: string;
  createdAt: string;
  cashierName: string;
  customerName: string;
  customerPhone?: string;
  status: 'COMPLETED' | 'HELD' | 'VOIDED' | 'REFUNDED';
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  roundOff: number;
  grandTotal: number;
  paymentMethods: string[];
  itemsCount: number;
  items: {
    productId: string;
    productName: string;
    cutType: string;
    weightKg: number;
    unitPrice: number;
    subtotal: number;
  }[];
}

export interface PurchaseLotReport {
  id: string;
  lotNumber: string;
  productName: string;
  supplierName: string;
  landingPort: string;
  receivedWeightKg: number;
  costPerKg: number;
  totalValue: number;
  receivedAt: string;
  expiryDate?: string;
}

export interface PurchaseReportSummary {
  storeId: string;
  totalSpend: number;
  totalWeightKg: number;
  averageCostPerKg: number;
  activeLotsCount: number;
  supplierBreakdown: {
    supplierName: string;
    landingPort: string;
    totalWeightKg: number;
    totalSpend: number;
    lotsCount: number;
  }[];
  lots: PurchaseLotReport[];
}

export interface StockReportItem {
  productId: string;
  sku: string;
  productName: string;
  localName?: string;
  categoryName: string;
  unitType: UnitType;
  costPrice: number;
  sellingPrice: number;
  physicalStock: number;
  reservedStock: number;
  availableStock: number;
  minStockAlert: number;
  isLowStock: boolean;
  costValuation: number;
  retailValuation: number;
  updatedAt: string;
}

export interface StockReportSummary {
  storeId: string;
  totalItemsCount: number;
  totalPhysicalWeightKg: number;
  totalReservedWeightKg: number;
  totalAvailableWeightKg: number;
  totalCostValuation: number;
  totalRetailValuation: number;
  potentialGrossMarginPct: number;
  lowStockCount: number;
  items: StockReportItem[];
}

export interface WastageLogRecord {
  id: string;
  productId: string;
  productName: string;
  quantityKg: number;
  wastageReason: 'CUTTING_LOSS' | 'SPOILAGE' | 'ICE_MELT' | 'EXPIRED' | 'DAMAGED' | 'OTHER';
  estimatedLossValue: number;
  notes?: string;
  createdAt: string;
}

export interface WastageReportSummary {
  storeId: string;
  totalWastageKg: number;
  totalLossValue: number;
  entriesCount: number;
  breakdownByReason: {
    reason: string;
    weightKg: number;
    lossValue: number;
    count: number;
  }[];
  records: WastageLogRecord[];
}

export interface ProfitTaxReport {
  storeId: string;
  dateRange: { startDate?: string; endDate?: string };
  taxableTurnover: number;
  cgstAmount25: number;
  sgstAmount25: number;
  totalTaxCollected: number;
  totalGrossRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossMarginPct: number;
}

export interface Company {
  id: string;
  code: string;
  legal_name: string;
  trade_name: string;
  cin_number?: string;
  gstin: string;
  pan_number?: string;
  fssai_central_license?: string;
  registered_address?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  currency: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type BranchTypeEnum = 'RETAIL_STORE' | 'CENTRAL_COLD_HUB' | 'DARK_STORE_FULFILLMENT' | 'HARBOR_WHARF';

export interface Branch {
  id: string;
  company_id?: string;
  company_name?: string;
  code: string;
  name: string;
  branch_type: BranchTypeEnum;
  address?: string;
  city: string;
  state: string;
  pincode: string;
  gstin?: string;
  fssai_state_license?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  num_registers: number;
  chiller_capacity_kg: number;
  scale_ip?: string;
  scale_port?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

