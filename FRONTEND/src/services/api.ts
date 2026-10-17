import {
  Product,
  Category,
  OnlineOrder,
  ShiftInfo,
  Sale,
  CartItem,
  PaymentItem,
  User,
  RolePermissionsMatrix,
  SalesReportSummary,
  SalesRegisterItem,
  PurchaseReportSummary,
  StockReportSummary,
  WastageReportSummary,
  ProfitTaxReport,
  ProductPriceHistoryRecord,
  BulkPriceUpdatePayload,
  CustomerAccount,
  Company,
  Branch
} from '../types';
import {
  mockProducts,
  mockCategories,
  mockOnlineOrders,
  mockInitialShift,
  mockUsers,
  mockRolePermissionsMatrix,
  mockSalesReportSummary,
  mockSalesRegister,
  mockPurchaseReportSummary,
  mockStockReportSummary,
  mockWastageReportSummary,
  mockProfitTaxReport,
  mockShiftsReportList,
  mockCustomers,
  mockCompanies,
  mockBranches
} from './mockData';

const BASE_URL = '/api/v1';

// In-memory price history mock storage
const mockPriceHistoryStore: Record<string, ProductPriceHistoryRecord[]> = {
  'prod-01': [
    { id: 'ph-1', product_id: 'prod-01', old_selling_price: 900, new_selling_price: 950, changed_by: 'Store SuperAdmin', changed_at: new Date(Date.now() - 86400000 * 2).toISOString(), reason: 'Fresh Kasimedu harbor catch rate adjustment' },
    { id: 'ph-2', product_id: 'prod-01', old_selling_price: 850, new_selling_price: 900, changed_by: 'Store SuperAdmin', changed_at: new Date(Date.now() - 86400000 * 10).toISOString(), reason: 'Weekend demand revision' }
  ],
  'prod-02': [
    { id: 'ph-3', product_id: 'prod-02', old_selling_price: 1050, new_selling_price: 1100, changed_by: 'Prakash Store Manager', changed_at: new Date(Date.now() - 86400000 * 3).toISOString(), reason: 'White Pomfret shortage adjustment' }
  ]
};

export const api = {
  // Authentication
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    try {
      const res = await fetch(`${BASE_URL}/auth/login-json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        return {
          token: data.access_token,
          user: {
            id: data.user_id,
            username: data.username,
            email: `${data.username}@meanomeen.com`,
            fullName: data.full_name,
            role: data.role
          }
        };
      }
    } catch {
      // Fallback to mock
    }

    // Mock Login Matcher
    const matchedUser = Object.values(mockUsers).find(u => u.username === username);
    if (matchedUser) {
      return {
        token: `mock-jwt-token-${matchedUser.id}`,
        user: matchedUser
      };
    }

    // Default fallback to cashier
    return {
      token: 'mock-jwt-cashier-token',
      user: mockUsers.CASHIER
    };
  },

  // Role Permissions Matrix
  async getRolePermissionsMatrix(): Promise<RolePermissionsMatrix> {
    try {
      const res = await fetch(`${BASE_URL}/auth/roles-permissions`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return mockRolePermissionsMatrix;
  },

  // Products & Categories
  async getProducts(includeInactive = false): Promise<Product[]> {
    try {
      const res = await fetch(`${BASE_URL}/products?include_inactive=${includeInactive}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) return data;
      }
    } catch {
      // Fallback
    }
    return includeInactive ? mockProducts : mockProducts.filter(p => p.is_active);
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const cat = mockCategories.find(c => c.id === productData.category_id);
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      sku: productData.sku || `FISH-${Date.now().toString().slice(-4)}`,
      barcode: productData.barcode || `890${Math.floor(1000 + Math.random() * 9000)}`,
      name: productData.name || 'New Fish Variety',
      local_name: productData.local_name,
      scientific_name: productData.scientific_name,
      category_id: productData.category_id || 'cat-sea',
      category_name: cat ? cat.name : 'Sea Fish',
      unit_type: productData.unit_type || 'KG',
      selling_price: Number(productData.selling_price || 0),
      cost_price: Number(productData.cost_price || 0),
      tax_rate: Number(productData.tax_rate || 5.0),
      cut_options: productData.cut_options && productData.cut_options.length > 0
        ? productData.cut_options
        : ['Whole', 'Curry Cut', 'Steaks / Slices', 'Cleaned'],
      min_stock_alert: Number(productData.min_stock_alert || 5.0),
      is_online_listed: productData.is_online_listed ?? true,
      image_url: productData.image_url,
      current_stock: Number(productData.current_stock || 0),
      is_active: productData.is_active ?? true
    };
    mockProducts.unshift(newProduct);

    // Initial Price History Record
    if (!mockPriceHistoryStore[newProduct.id]) {
      mockPriceHistoryStore[newProduct.id] = [];
    }
    mockPriceHistoryStore[newProduct.id].unshift({
      id: `ph-${Date.now()}`,
      product_id: newProduct.id,
      old_selling_price: 0,
      new_selling_price: newProduct.selling_price,
      changed_by: 'Super Admin',
      changed_at: new Date().toISOString(),
      reason: 'Initial Product Creation'
    });

    return newProduct;
  },

  async updateProduct(id: string, updateData: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const prod = mockProducts.find(p => p.id === id);
    if (prod) {
      if (updateData.selling_price !== undefined && updateData.selling_price !== prod.selling_price) {
        if (!mockPriceHistoryStore[id]) mockPriceHistoryStore[id] = [];
        mockPriceHistoryStore[id].unshift({
          id: `ph-${Date.now()}`,
          product_id: id,
          old_selling_price: prod.selling_price,
          new_selling_price: updateData.selling_price,
          changed_by: 'Super Admin',
          changed_at: new Date().toISOString(),
          reason: 'Product Master Direct Update'
        });
      }
      if (updateData.category_id) {
        const cat = mockCategories.find(c => c.id === updateData.category_id);
        if (cat) updateData.category_name = cat.name;
      }
      Object.assign(prod, updateData);
      return prod;
    }
    throw new Error('Product not found');
  },

  async deleteProduct(id: string): Promise<{ message: string; id: string }> {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const prod = mockProducts.find(p => p.id === id);
    if (prod) {
      prod.is_active = false;
      return { message: 'Product archived successfully', id };
    }
    throw new Error('Product not found');
  },

  async updateProductPrice(id: string, newSellingPrice: number, reason?: string): Promise<Product> {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}/price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_selling_price: newSellingPrice, reason })
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const prod = mockProducts.find(p => p.id === id);
    if (prod) {
      const old = prod.selling_price;
      prod.selling_price = newSellingPrice;

      if (!mockPriceHistoryStore[id]) mockPriceHistoryStore[id] = [];
      mockPriceHistoryStore[id].unshift({
        id: `ph-${Date.now()}`,
        product_id: id,
        old_selling_price: old,
        new_selling_price: newSellingPrice,
        changed_by: 'Store Manager',
        changed_at: new Date().toISOString(),
        reason: reason || 'Live Catch Price Revision'
      });
      return prod;
    }
    throw new Error('Product not found');
  },

  async getProductPriceHistory(productId: string): Promise<ProductPriceHistoryRecord[]> {
    try {
      const res = await fetch(`${BASE_URL}/products/${productId}/price-history`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) return data;
      }
    } catch {
      // Fallback
    }
    return mockPriceHistoryStore[productId] || [
      {
        id: `ph-default-${productId}`,
        product_id: productId,
        old_selling_price: 0,
        new_selling_price: mockProducts.find(p => p.id === productId)?.selling_price || 0,
        changed_by: 'System Initial Seed',
        changed_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        reason: 'Master Launch Base Price'
      }
    ];
  },

  async bulkUpdatePrices(payload: BulkPriceUpdatePayload): Promise<Product[]> {
    try {
      const res = await fetch(`${BASE_URL}/products/bulk-price-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const updated: Product[] = [];
    payload.items.forEach(item => {
      const prod = mockProducts.find(p => p.id === item.product_id);
      if (prod) {
        const oldPrice = prod.selling_price;
        prod.selling_price = item.new_selling_price;
        if (!mockPriceHistoryStore[prod.id]) mockPriceHistoryStore[prod.id] = [];
        mockPriceHistoryStore[prod.id].unshift({
          id: `ph-${Date.now()}-${prod.id}`,
          product_id: prod.id,
          old_selling_price: oldPrice,
          new_selling_price: item.new_selling_price,
          changed_by: 'Manager Landing Rate Updater',
          changed_at: new Date().toISOString(),
          reason: payload.reason || 'Bulk Morning Catch Adjustment'
        });
        updated.push(prod);
      }
    });
    return updated;
  },

  async getCategories(includeInactive = false): Promise<Category[]> {
    try {
      const res = await fetch(`${BASE_URL}/categories?include_inactive=${includeInactive}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return includeInactive ? mockCategories : mockCategories.filter(c => c.is_active);
  },

  async createCategory(catData: Partial<Category>): Promise<Category> {
    try {
      const res = await fetch(`${BASE_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catData)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: catData.name || 'New Category',
      code: catData.code || `CAT-${Date.now().toString().slice(-3)}`,
      description: catData.description,
      icon: catData.icon || 'Fish',
      display_order: catData.display_order || mockCategories.length,
      is_active: true
    };
    mockCategories.push(newCat);
    return newCat;
  },

  async updateCategory(id: string, updateData: Partial<Category>): Promise<Category> {
    try {
      const res = await fetch(`${BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const cat = mockCategories.find(c => c.id === id);
    if (cat) {
      Object.assign(cat, updateData);
      return cat;
    }
    throw new Error('Category not found');
  },

  async deleteCategory(id: string): Promise<{ message: string; id: string }> {
    try {
      const res = await fetch(`${BASE_URL}/categories/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const cat = mockCategories.find(c => c.id === id);
    if (cat) {
      cat.is_active = false;
      return { message: 'Category archived successfully', id };
    }
    throw new Error('Category not found');
  },

  // Sales & POS Checkout
  async checkoutSale(data: {
    storeId: string;
    shiftId: string;
    items: CartItem[];
    payments: PaymentItem[];
    customer?: { name: string; phone: string };
    overallDiscount?: number;
    notes?: string;
  }): Promise<Sale> {
    const subtotal = data.items.reduce((acc, i) => acc + i.subtotal, 0);
    const taxAmount = data.items.reduce((acc, i) => acc + i.taxAmount, 0);
    const discountAmount = data.overallDiscount || 0;
    const rawTotal = subtotal - discountAmount;
    const grandTotal = Math.round(rawTotal);
    const roundOff = Number((grandTotal - rawTotal).toFixed(2));

    const saleNumber = `SALE-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const salePayload: Sale = {
      id: `sale-${Date.now()}`,
      saleNumber,
      storeId: data.storeId,
      shiftId: data.shiftId,
      cashierName: 'Karthik Cashier',
      customerName: data.customer?.name || 'Walk-in Guest',
      customerPhone: data.customer?.phone || '',
      status: 'COMPLETED',
      subtotal,
      discountAmount,
      taxAmount,
      roundOff,
      grandTotal,
      items: data.items,
      payments: data.payments,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${BASE_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: data.storeId,
          shift_id: data.shiftId,
          customer: data.customer,
          items: data.items.map(i => ({
            product_id: i.productId,
            cut_type: i.cutType,
            weight_kg: i.weightKg,
            discount_amount: i.discountAmount
          })),
          overall_discount: data.overallDiscount || 0,
          payments: data.payments.map(p => ({
            payment_method: p.method,
            amount: p.amount,
            tendered_amount: p.tenderedAmount,
            transaction_ref: p.transactionRef
          }))
        })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    return salePayload;
  },

  // Online Orders
  async getOnlineOrders(): Promise<OnlineOrder[]> {
    try {
      const res = await fetch(`${BASE_URL}/online-orders`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return mockOnlineOrders;
  },

  async createOnlineOrder(orderData: any): Promise<OnlineOrder> {
    try {
      const res = await fetch(`${BASE_URL}/online-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return mockOnlineOrders[0];
  },

  // Customer Registration & Mobile Auth
  async registerCustomer(data: { name: string; phone: string; email?: string; address?: string }): Promise<CustomerAccount> {
    try {
      const res = await fetch(`${BASE_URL}/customers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const cleanPhone = data.phone.trim().replace(/\s|-/g, '');
    const existing = mockCustomers.find(c => c.phone === cleanPhone);
    if (existing) {
      existing.name = data.name;
      if (data.address) existing.address = data.address;
      if (data.email) existing.email = data.email;
      return existing;
    }

    const newCust: CustomerAccount = {
      id: `cust-${Date.now()}`,
      name: data.name,
      phone: cleanPhone,
      email: data.email,
      address: data.address,
      loyalty_points: 50,
      total_spent: 0,
      created_at: new Date().toISOString()
    };
    mockCustomers.push(newCust);
    return newCust;
  },

  async loginCustomerWithPhone(phone: string): Promise<CustomerAccount> {
    const cleanPhone = phone.trim().replace(/\s|-/g, '');
    try {
      const res = await fetch(`${BASE_URL}/customers/login-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const found = mockCustomers.find(c => c.phone === cleanPhone);
    if (found) return found;

    throw new Error(`Mobile number ${phone} is not registered. Please register first.`);
  },

  async getCustomerByPhone(phone: string): Promise<CustomerAccount | null> {
    const cleanPhone = phone.trim().replace(/\s|-/g, '');
    try {
      const res = await fetch(`${BASE_URL}/customers/by-phone/${cleanPhone}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return mockCustomers.find(c => c.phone === cleanPhone) || null;
  },

  // Shift info
  async getCurrentShift(): Promise<ShiftInfo> {
    try {
      const res = await fetch(`${BASE_URL}/shifts/current?store_id=store-01`);
      if (res.ok) {
        const data = await res.json();
        if (data) return data;
      }
    } catch {
      // Fallback
    }
    return mockInitialShift;
  },

  // ----------------------------------------------------
  // Reports API Handlers
  // ----------------------------------------------------

  async getSalesReportSummary(params?: { startDate?: string; endDate?: string }): Promise<SalesReportSummary> {
    try {
      const query = new URLSearchParams({ store_id: 'store-01' });
      if (params?.startDate) query.append('start_date', params.startDate);
      if (params?.endDate) query.append('end_date', params.endDate);

      const res = await fetch(`${BASE_URL}/reports/sales-summary?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return {
          storeId: data.store_id,
          dateRange: data.date_range,
          grossSales: Number(data.gross_sales || 0),
          netSales: Number(data.net_sales || 0),
          totalTax: Number(data.total_tax || 0),
          totalDiscount: Number(data.total_discount || 0),
          transactionCount: data.transaction_count || 0,
          averageBasketSize: Number(data.average_basket_size || 0),
          paymentBreakdown: {
            cash: Number(data.payment_breakdown?.cash || 0),
            upi: Number(data.payment_breakdown?.upi || 0),
            card: Number(data.payment_breakdown?.card || 0),
            total: Number(data.payment_breakdown?.total || 0)
          },
          topProducts: (data.top_products || []).map((tp: any) => ({
            productId: tp.product_id,
            productName: tp.product_name,
            weightKg: Number(tp.weight_kg),
            revenue: Number(tp.revenue),
            orderCount: tp.order_count
          })),
          hourlySales: (data.hourly_sales || []).map((hs: any) => ({
            hour: hs.hour,
            salesCount: hs.sales_count,
            revenue: Number(hs.revenue)
          }))
        };
      }
    } catch {
      // Fallback to mock
    }
    return mockSalesReportSummary;
  },

  async getSalesRegister(params?: { startDate?: string; endDate?: string; paymentMethod?: string; search?: string }): Promise<SalesRegisterItem[]> {
    try {
      const query = new URLSearchParams({ store_id: 'store-01' });
      if (params?.startDate) query.append('start_date', params.startDate);
      if (params?.endDate) query.append('end_date', params.endDate);
      if (params?.paymentMethod && params.paymentMethod !== 'ALL') query.append('payment_method', params.paymentMethod);
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`${BASE_URL}/reports/sales-register?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return data.map((d: any) => ({
          id: d.id,
          saleNumber: d.sale_number,
          createdAt: d.created_at,
          cashierName: d.cashier_name,
          customerName: d.customer_name,
          customerPhone: d.customer_phone,
          status: d.status,
          subtotal: Number(d.subtotal),
          discountAmount: Number(d.discount_amount),
          taxAmount: Number(d.tax_amount),
          roundOff: Number(d.round_off),
          grandTotal: Number(d.grand_total),
          paymentMethods: d.payment_methods || [],
          itemsCount: d.items_count || (d.items?.length || 0),
          items: (d.items || []).map((it: any) => ({
            productId: it.product_id,
            productName: it.product_name,
            cutType: it.cut_type,
            weightKg: Number(it.weight_kg),
            unitPrice: Number(it.unit_price),
            subtotal: Number(it.subtotal)
          }))
        }));
      }
    } catch {
      // Fallback
    }
    return mockSalesRegister;
  },

  async getPurchaseReport(params?: { startDate?: string; endDate?: string }): Promise<PurchaseReportSummary> {
    try {
      const query = new URLSearchParams({ store_id: 'store-01' });
      if (params?.startDate) query.append('start_date', params.startDate);
      if (params?.endDate) query.append('end_date', params.endDate);

      const res = await fetch(`${BASE_URL}/reports/purchase-report?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return {
          storeId: data.store_id,
          totalSpend: Number(data.total_spend || 0),
          totalWeightKg: Number(data.total_weight_kg || 0),
          averageCostPerKg: Number(data.average_cost_per_kg || 0),
          activeLotsCount: data.active_lots_count || 0,
          supplierBreakdown: (data.supplier_breakdown || []).map((sb: any) => ({
            supplierName: sb.supplier_name,
            landingPort: sb.landing_port,
            totalWeightKg: Number(sb.total_weight_kg),
            totalSpend: Number(sb.total_spend),
            lotsCount: sb.lots_count
          })),
          lots: (data.lots || []).map((l: any) => ({
            id: l.id,
            lotNumber: l.lot_number,
            productName: l.product_name,
            supplierName: l.supplier_name,
            landingPort: l.landing_port,
            receivedWeightKg: Number(l.received_weight_kg),
            costPerKg: Number(l.cost_per_kg),
            totalValue: Number(l.total_value),
            receivedAt: l.received_at,
            expiryDate: l.expiry_date
          }))
        };
      }
    } catch {
      // Fallback
    }
    return mockPurchaseReportSummary;
  },

  async getStockReport(params?: { categoryId?: string; lowStockOnly?: boolean }): Promise<StockReportSummary> {
    try {
      const query = new URLSearchParams({ store_id: 'store-01' });
      if (params?.categoryId && params.categoryId !== 'cat-all') query.append('category_id', params.categoryId);
      if (params?.lowStockOnly) query.append('low_stock_only', 'true');

      const res = await fetch(`${BASE_URL}/reports/stock-report?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return {
          storeId: data.store_id,
          totalItemsCount: data.total_items_count,
          totalPhysicalWeightKg: Number(data.total_physical_weight_kg),
          totalReservedWeightKg: Number(data.total_reserved_weight_kg),
          totalAvailableWeightKg: Number(data.total_available_weight_kg),
          totalCostValuation: Number(data.total_cost_valuation),
          totalRetailValuation: Number(data.total_retail_valuation),
          potentialGrossMarginPct: Number(data.potential_gross_margin_pct),
          lowStockCount: data.low_stock_count,
          items: (data.items || []).map((it: any) => ({
            productId: it.product_id,
            sku: it.sku,
            productName: it.product_name,
            localName: it.local_name,
            categoryName: it.category_name,
            unitType: it.unit_type,
            costPrice: Number(it.cost_price),
            sellingPrice: Number(it.selling_price),
            physicalStock: Number(it.physical_stock),
            reservedStock: Number(it.reserved_stock),
            availableStock: Number(it.available_stock),
            minStockAlert: Number(it.min_stock_alert),
            isLowStock: it.is_low_stock,
            costValuation: Number(it.cost_valuation),
            retailValuation: Number(it.retail_valuation),
            updatedAt: it.updated_at
          }))
        };
      }
    } catch {
      // Fallback
    }
    return mockStockReportSummary;
  },

  async getWastageReport(params?: { startDate?: string; endDate?: string }): Promise<WastageReportSummary> {
    try {
      const query = new URLSearchParams({ store_id: 'store-01' });
      if (params?.startDate) query.append('start_date', params.startDate);
      if (params?.endDate) query.append('end_date', params.endDate);

      const res = await fetch(`${BASE_URL}/reports/wastage-report?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return {
          storeId: data.store_id,
          totalWastageKg: Number(data.total_wastage_kg),
          totalLossValue: Number(data.total_loss_value),
          entriesCount: data.entries_count,
          breakdownByReason: (data.breakdown_by_reason || []).map((br: any) => ({
            reason: br.reason,
            weightKg: Number(br.weight_kg),
            lossValue: Number(br.loss_value),
            count: br.count
          })),
          records: (data.records || []).map((r: any) => ({
            id: r.id,
            productId: r.product_id,
            productName: r.product_name,
            quantityKg: Number(r.quantity_kg),
            wastageReason: r.wastage_reason,
            estimatedLossValue: Number(r.estimated_loss_value),
            notes: r.notes,
            createdAt: r.created_at
          }))
        };
      }
    } catch {
      // Fallback
    }
    return mockWastageReportSummary;
  },

  async getProfitTaxReport(params?: { startDate?: string; endDate?: string }): Promise<ProfitTaxReport> {
    try {
      const query = new URLSearchParams({ store_id: 'store-01' });
      if (params?.startDate) query.append('start_date', params.startDate);
      if (params?.endDate) query.append('end_date', params.endDate);

      const res = await fetch(`${BASE_URL}/reports/profit-tax?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return {
          storeId: data.store_id,
          dateRange: data.date_range,
          taxableTurnover: Number(data.taxable_turnover),
          cgstAmount25: Number(data.cgst_amount_2_5),
          sgstAmount25: Number(data.sgst_amount_2_5),
          totalTaxCollected: Number(data.total_tax_collected),
          totalGrossRevenue: Number(data.total_gross_revenue),
          costOfGoodsSold: Number(data.cost_of_goods_sold),
          grossProfit: Number(data.gross_profit),
          grossMarginPct: Number(data.gross_margin_pct)
        };
      }
    } catch {
      // Fallback
    }
    return mockProfitTaxReport;
  },

  async getShiftsReport(params?: { startDate?: string; endDate?: string }): Promise<any[]> {
    try {
      const query = new URLSearchParams({ store_id: 'store-01' });
      if (params?.startDate) query.append('start_date', params.startDate);
      if (params?.endDate) query.append('end_date', params.endDate);

      const res = await fetch(`${BASE_URL}/reports/shifts-summary?${query.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return mockShiftsReportList;
  },

  // ----------------------------------------------------
  // Company & Branch Master API Handlers
  // ----------------------------------------------------

  async getCompanies(): Promise<Company[]> {
    try {
      const res = await fetch(`${BASE_URL}/masters/companies`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) return data;
      }
    } catch {
      // Fallback
    }
    return mockCompanies as unknown as Company[];
  },

  async createCompany(companyData: Partial<Company>): Promise<Company> {
    try {
      const res = await fetch(`${BASE_URL}/masters/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const newComp: Company = {
      id: `comp-${Date.now()}`,
      code: companyData.code || `COMP-${Date.now()}`,
      legal_name: companyData.legal_name || 'New Seafood Corp Pvt Ltd',
      trade_name: companyData.trade_name || 'New Seafoods',
      cin_number: companyData.cin_number,
      gstin: companyData.gstin || '33AAAAA0000A1Z5',
      pan_number: companyData.pan_number,
      fssai_central_license: companyData.fssai_central_license,
      registered_address: companyData.registered_address,
      city: companyData.city || 'Coimbatore',
      state: companyData.state || 'Tamil Nadu',
      pincode: companyData.pincode || '641002',
      country: 'India',
      phone: companyData.phone,
      email: companyData.email,
      website: companyData.website,
      currency: 'INR',
      logo_url: '/logo.jpg',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    (mockCompanies as any).unshift(newComp);
    return newComp;
  },

  async updateCompany(id: string, updateData: Partial<Company>): Promise<Company> {
    try {
      const res = await fetch(`${BASE_URL}/masters/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const comp = (mockCompanies as any[]).find(c => c.id === id);
    if (comp) {
      Object.assign(comp, updateData, { updated_at: new Date().toISOString() });
      return comp;
    }
    throw new Error('Company not found');
  },

  async getBranches(companyId?: string): Promise<Branch[]> {
    try {
      const url = companyId ? `${BASE_URL}/masters/branches?company_id=${companyId}` : `${BASE_URL}/masters/branches`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) return data;
      }
    } catch {
      // Fallback
    }
    if (companyId) {
      return (mockBranches as unknown as Branch[]).filter(b => b.company_id === companyId);
    }
    return mockBranches as unknown as Branch[];
  },

  async createBranch(branchData: Partial<Branch>): Promise<Branch> {
    try {
      const res = await fetch(`${BASE_URL}/masters/branches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchData)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const newBranch: Branch = {
      id: `store-${Date.now()}`,
      company_id: branchData.company_id || 'comp-001',
      company_name: 'MeanOmeen Marine Foods & Retail Pvt Ltd',
      code: branchData.code || `CBE-BR-${Date.now().toString().slice(-3)}`,
      name: branchData.name || 'New Coimbatore Outlet',
      branch_type: branchData.branch_type || 'RETAIL_STORE',
      address: branchData.address || 'Coimbatore',
      city: branchData.city || 'Coimbatore',
      state: branchData.state || 'Tamil Nadu',
      pincode: branchData.pincode || '641002',
      gstin: branchData.gstin || '33AAAAA0000A1Z5',
      fssai_state_license: branchData.fssai_state_license,
      contact_person: branchData.contact_person,
      phone: branchData.phone,
      email: branchData.email,
      num_registers: branchData.num_registers || 2,
      chiller_capacity_kg: branchData.chiller_capacity_kg || 500.0,
      scale_ip: branchData.scale_ip || '192.168.1.120',
      scale_port: branchData.scale_port || 9100,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    (mockBranches as any).unshift(newBranch);
    return newBranch;
  },

  async updateBranch(id: string, updateData: Partial<Branch>): Promise<Branch> {
    try {
      const res = await fetch(`${BASE_URL}/masters/branches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const branch = (mockBranches as any[]).find(b => b.id === id);
    if (branch) {
      Object.assign(branch, updateData, { updated_at: new Date().toISOString() });
      return branch;
    }
    throw new Error('Branch not found');
  }
};

