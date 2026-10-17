import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, CartItem, Sale, ShiftInfo, OnlineOrder, PaymentItem, User, UserRole, RolePermissionsMatrix, CustomerCartItem, CustomerAccount, Company, Branch } from '../types';
import { api } from '../services/api';
import { mockProducts, mockCategories, mockOnlineOrders, mockInitialShift, mockUsers, mockRolePermissionsMatrix, mockCustomers, mockCompanies, mockBranches } from '../services/mockData';

export type AppTab = 'pos' | 'online-orders' | 'inventory' | 'reports' | 'masters' | 'customer-store' | 'customer-tracking';

interface POSContextType {
  // Authentication & RBAC (Strict Single Active Role Session)
  currentUser: User | null;
  isAuthenticated: boolean;
  currentRegister: string;
  loginUser: (username: string, password: string, register?: string, branchId?: string) => Promise<void>;
  loginAsCustomer: (customer?: CustomerAccount) => void;
  logoutUser: () => void;
  switchRoleDemo: (role: UserRole) => void;
  rolePermissionsMatrix: RolePermissionsMatrix;
  hasPermission: (key: string) => boolean;

  // Company & Branch Masters
  companies: Company[];
  branches: Branch[];
  activeCompany: Company | null;
  activeBranch: Branch | null;
  setActiveCompany: (company: Company | null) => void;
  setActiveBranch: (branch: Branch | null) => void;
  reloadCompaniesAndBranches: () => Promise<void>;

  // Dedicated Role Loading State
  isRoleLoading: boolean;
  loadingRole: UserRole | 'CUSTOMER' | null;
  loadingRoleFullName: string;
  loadingRoleTerminal: string;
  dismissRoleLoading: () => void;

  // Registered Customer Mobile Authentication
  currentCustomer: CustomerAccount | null;
  registerCustomerAccount: (data: { name: string; phone: string; email?: string; address?: string }) => Promise<CustomerAccount>;
  loginCustomerAccountWithPhone: (phone: string) => Promise<CustomerAccount>;
  logoutCustomerAccount: () => void;

  isRolePermissionsModalOpen: boolean;
  setIsRolePermissionsModalOpen: (open: boolean) => void;

  isRoleSwitcherModalOpen: boolean;
  setIsRoleSwitcherModalOpen: (open: boolean) => void;

  // Navigation
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  // Catalog
  products: Product[];
  categories: Category[];
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addProduct: (productData: Partial<Product>) => Promise<Product>;
  updateProductItem: (id: string, updateData: Partial<Product>) => Promise<Product>;
  deleteProductItem: (id: string) => Promise<void>;
  updateProductPriceItem: (id: string, newSellingPrice: number, reason?: string) => Promise<void>;
  bulkUpdatePricesList: (payload: { items: { product_id: string; new_selling_price: number }[]; reason?: string }) => Promise<void>;
  reloadProducts: () => Promise<void>;
  addCategoryItem: (catData: Partial<Category>) => Promise<Category>;
  updateCategoryItem: (id: string, updateData: Partial<Category>) => Promise<Category>;
  deleteCategoryItem: (id: string) => Promise<void>;
  reloadCategories: () => Promise<void>;

  // POS Cart & Line Items
  cart: CartItem[];
  addToCart: (product: Product, weightKg: number, cutType: string, discount?: number) => void;
  removeFromCart: (lineId: string) => void;
  updateCartItemWeight: (lineId: string, weightKg: number) => void;
  clearCart: () => void;

  // POS Cart Calculations
  subtotal: number;
  taxAmount: number;
  overallDiscount: number;
  setOverallDiscount: (discount: number) => void;
  grandTotal: number;
  itemCount: number;

  // Modals & Flows
  activeProductForWeight: Product | null;
  openWeightModal: (product: Product) => void;
  closeWeightModal: () => void;

  isPaymentModalOpen: boolean;
  openPaymentModal: () => void;
  closePaymentModal: () => void;

  isReceiptModalOpen: boolean;
  lastCompletedSale: Sale | null;
  closeReceiptModal: () => void;

  // Held Orders
  heldSales: { id: string; timestamp: string; customerName: string; items: CartItem[]; grandTotal: number }[];
  holdCurrentSale: (customerName?: string) => void;
  recallHeldSale: (heldId: string) => void;
  isHeldModalOpen: boolean;
  setIsHeldModalOpen: (open: boolean) => void;

  // Shift & Register
  currentShift: ShiftInfo;

  // Online Orders (Omnichannel Staff)
  onlineOrders: OnlineOrder[];
  updateOrderStatus: (orderId: string, newStatus: OnlineOrder['status']) => void;

  // Customer Storefront Cart & Orders
  customerCart: CustomerCartItem[];
  addCustomerCartItem: (product: Product, weightKg: number, cutType: string, cookingRecommendation?: string, specialNotes?: string) => void;
  removeCustomerCartItem: (id: string) => void;
  updateCustomerCartItemWeight: (id: string, weightKg: number) => void;
  clearCustomerCart: () => void;
  customerCartSubtotal: number;
  customerCartItemCount: number;
  activeTrackingOrder: OnlineOrder | null;
  setActiveTrackingOrder: (order: OnlineOrder | null) => void;
  placeCustomerOnlineOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    deliveryType: 'HOME_DELIVERY' | 'STORE_PICKUP';
    deliveryAddress?: string;
    deliverySlot?: string;
    specialInstructions?: string;
    paymentMethod: string;
  }) => Promise<OnlineOrder>;

  // Checkout Execution
  processCheckout: (payments: PaymentItem[], customerName?: string, customerPhone?: string) => Promise<Sale>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state - defaults to unauthenticated so Login Page is the landing view
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentRegister, setCurrentRegister] = useState<string>('REG-01');
  const [rolePermissionsMatrix, setRolePermissionsMatrix] = useState<RolePermissionsMatrix>(mockRolePermissionsMatrix);
  const [isRolePermissionsModalOpen, setIsRolePermissionsModalOpen] = useState<boolean>(false);
  const [isRoleSwitcherModalOpen, setIsRoleSwitcherModalOpen] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<AppTab>('pos');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat-all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [overallDiscount, setOverallDiscount] = useState<number>(0);

  // Customer Online Storefront & Mobile Auth State
  const [customerCart, setCustomerCart] = useState<CustomerCartItem[]>([]);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<OnlineOrder | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerAccount | null>(null);

  const [activeProductForWeight, setActiveProductForWeight] = useState<Product | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);

  const [heldSales, setHeldSales] = useState<{ id: string; timestamp: string; customerName: string; items: CartItem[]; grandTotal: number }[]>([]);
  const [isHeldModalOpen, setIsHeldModalOpen] = useState<boolean>(false);

  const [currentShift, setCurrentShift] = useState<ShiftInfo>(mockInitialShift);
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>(mockOnlineOrders);

  // Company & Branch Master State
  const [companies, setCompanies] = useState<Company[]>(mockCompanies as unknown as Company[]);
  const [branches, setBranches] = useState<Branch[]>(mockBranches as unknown as Branch[]);
  const [activeCompany, setActiveCompany] = useState<Company | null>(mockCompanies[0] as unknown as Company);
  const [activeBranch, setActiveBranch] = useState<Branch | null>(mockBranches[0] as unknown as Branch);

  const reloadCompaniesAndBranches = async () => {
    const [cList, bList] = await Promise.all([
      api.getCompanies(),
      api.getBranches()
    ]);
    if (cList?.length) setCompanies(cList);
    if (bList?.length) setBranches(bList);
  };

  const reloadProducts = async () => {
    const prods = await api.getProducts(true);
    if (prods?.length) setProducts(prods);
  };

  const reloadCategories = async () => {
    const cats = await api.getCategories(true);
    if (cats?.length) setCategories(cats);
  };

  const addProduct = async (productData: Partial<Product>): Promise<Product> => {
    const created = await api.createProduct(productData);
    setProducts(prev => [created, ...prev]);
    return created;
  };

  const updateProductItem = async (id: string, updateData: Partial<Product>): Promise<Product> => {
    const updated = await api.updateProduct(id, updateData);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    return updated;
  };

  const deleteProductItem = async (id: string): Promise<void> => {
    await api.deleteProduct(id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: false } : p));
  };

  const updateProductPriceItem = async (id: string, newSellingPrice: number, reason?: string): Promise<void> => {
    await api.updateProductPrice(id, newSellingPrice, reason);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, selling_price: newSellingPrice } : p));
  };

  const bulkUpdatePricesList = async (payload: { items: { product_id: string; new_selling_price: number }[]; reason?: string }): Promise<void> => {
    const updatedList = await api.bulkUpdatePrices(payload);
    const updatedMap = new Map(updatedList.map(p => [p.id, p.selling_price]));
    setProducts(prev => prev.map(p => updatedMap.has(p.id) ? { ...p, selling_price: updatedMap.get(p.id)! } : p));
  };

  const addCategoryItem = async (catData: Partial<Category>): Promise<Category> => {
    const created = await api.createCategory(catData);
    setCategories(prev => [...prev, created]);
    return created;
  };

  const updateCategoryItem = async (id: string, updateData: Partial<Category>): Promise<Category> => {
    const updated = await api.updateCategory(id, updateData);
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    return updated;
  };

  const deleteCategoryItem = async (id: string): Promise<void> => {
    await api.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Load initial data
  useEffect(() => {
    async function loadData() {
      const [prods, cats, orders, shift, matrix, compList, branchList] = await Promise.all([
        api.getProducts(true),
        api.getCategories(true),
        api.getOnlineOrders(),
        api.getCurrentShift(),
        api.getRolePermissionsMatrix(),
        api.getCompanies(),
        api.getBranches()
      ]);
      if (prods?.length) setProducts(prods);
      if (cats?.length) setCategories(cats);
      if (orders?.length) setOnlineOrders(orders);
      if (shift) setCurrentShift(shift);
      if (matrix) setRolePermissionsMatrix(matrix);
      if (compList?.length) {
        setCompanies(compList);
        setActiveCompany(compList[0]);
      }
      if (branchList?.length) {
        setBranches(branchList);
        setActiveBranch(branchList[0]);
      }
    }
    loadData();
  }, []);

  // Dedicated Role Loading State
  const [isRoleLoading, setIsRoleLoading] = useState<boolean>(false);
  const [loadingRole, setLoadingRole] = useState<UserRole | 'CUSTOMER' | null>(null);
  const [loadingRoleFullName, setLoadingRoleFullName] = useState<string>('');
  const [loadingRoleTerminal, setLoadingRoleTerminal] = useState<string>('');

  const loginUser = async (username: string, password: string, register: string = 'REG-01', branchId?: string) => {
    const res = await api.login(username, password);
    setCurrentUser(res.user);
    setCurrentRegister(register);

    if (branchId) {
      const matchedBranch = branches.find(b => b.id === branchId || b.code === branchId);
      if (matchedBranch) {
        setActiveBranch(matchedBranch);
      }
    }

    // Adjust active tab based on role
    if (res.user.role === 'INVENTORY_MANAGER') {
      setActiveTab('inventory');
    } else if (res.user.role === 'ONLINE_ORDER_MANAGER') {
      setActiveTab('online-orders');
    } else if (res.user.role === 'STORE_MANAGER') {
      setActiveTab('reports');
    } else if (res.user.role === 'SUPER_ADMIN') {
      setActiveTab('masters');
    } else {
      setActiveTab('pos');
    }

    setCurrentShift(prev => ({
      ...prev,
      cashierName: res.user.fullName,
      registerNumber: register
    }));

    // Trigger Role-Specific Loading Experience
    setLoadingRole(res.user.role);
    setLoadingRoleFullName(res.user.fullName);
    setLoadingRoleTerminal(register);
    setIsRoleLoading(true);
    setIsAuthenticated(true);
  };

  const loginAsCustomer = (customer?: CustomerAccount) => {
    const cust = customer || currentCustomer || mockCustomers[0];
    setCurrentCustomer(cust);
    const customerUser: User = {
      id: cust.id,
      username: cust.phone,
      email: cust.email || `${cust.phone}@customer.local`,
      fullName: cust.name,
      role: 'CASHIER'
    };
    setCurrentUser(customerUser);
    setActiveTab('customer-store');

    // Trigger Customer Specific Loading Experience
    setLoadingRole('CUSTOMER');
    setLoadingRoleFullName(cust.name);
    setLoadingRoleTerminal('Coimbatore Online Storefront');
    setIsRoleLoading(true);
    setIsAuthenticated(true);
  };

  const registerCustomerAccount = async (data: { name: string; phone: string; email?: string; address?: string }): Promise<CustomerAccount> => {
    const cust = await api.registerCustomer(data);
    setCurrentCustomer(cust);
    loginAsCustomer(cust);
    return cust;
  };

  const loginCustomerAccountWithPhone = async (phone: string): Promise<CustomerAccount> => {
    const cust = await api.loginCustomerWithPhone(phone);
    setCurrentCustomer(cust);
    loginAsCustomer(cust);
    return cust;
  };

  const logoutCustomerAccount = () => {
    setCurrentCustomer(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    clearCustomerCart();
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    clearCart();
  };

  const switchRoleDemo = (role: UserRole) => {
    const user = mockUsers[role];
    if (user) {
      setCurrentUser(user);
      if (role === 'INVENTORY_MANAGER') setActiveTab('inventory');
      else if (role === 'ONLINE_ORDER_MANAGER') setActiveTab('online-orders');
      else if (role === 'STORE_MANAGER') setActiveTab('reports');
      else setActiveTab('pos');

      setCurrentShift(prev => ({
        ...prev,
        cashierName: user.fullName
      }));

      // Trigger Role-Specific Loading Experience
      setLoadingRole(role);
      setLoadingRoleFullName(user.fullName);
      setLoadingRoleTerminal(`Node: ${role}`);
      setIsRoleLoading(true);
      setIsAuthenticated(true);
    }
  };

  const dismissRoleLoading = () => {
    setIsRoleLoading(false);
  };

  const hasPermission = (key: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN') return true;
    if (key === 'MASTERS:VIEW') return currentUser.role === 'STORE_MANAGER';
    return rolePermissionsMatrix.matrix[currentUser.role]?.[key] ?? false;
  };

  const openWeightModal = (product: Product) => {
    setActiveProductForWeight(product);
  };

  const closeWeightModal = () => {
    setActiveProductForWeight(null);
  };

  const addToCart = (product: Product, weightKg: number, cutType: string, discount: number = 0) => {
    const baseAmount = Number((weightKg * product.selling_price).toFixed(2));
    const taxableAmount = Math.max(0, baseAmount - discount);
    const taxAmount = Number(((taxableAmount * product.tax_rate) / 100).toFixed(2));
    const subtotal = Number((taxableAmount + taxAmount).toFixed(2));

    const newItem: CartItem = {
      id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: product.id,
      name: product.name,
      localName: product.local_name,
      imageUrl: product.image_url,
      sku: product.sku,
      cutType,
      unitType: product.unit_type,
      weightKg,
      unitPrice: product.selling_price,
      discountAmount: discount,
      taxRate: product.tax_rate,
      taxAmount,
      subtotal
    };

    setCart(prev => [...prev, newItem]);
    closeWeightModal();
  };

  const removeFromCart = (lineId: string) => {
    setCart(prev => prev.filter(item => item.id !== lineId));
  };

  const updateCartItemWeight = (lineId: string, weightKg: number) => {
    setCart(prev => prev.map(item => {
      if (item.id !== lineId) return item;
      const baseAmount = Number((weightKg * item.unitPrice).toFixed(2));
      const taxableAmount = Math.max(0, baseAmount - item.discountAmount);
      const taxAmount = Number(((taxableAmount * item.taxRate) / 100).toFixed(2));
      const subtotal = Number((taxableAmount + taxAmount).toFixed(2));
      return { ...item, weightKg, taxAmount, subtotal };
    }));
  };

  const clearCart = () => {
    setCart([]);
    setOverallDiscount(0);
  };

  // Cart calculations
  const subtotal = Number(cart.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2));
  const taxAmount = Number(cart.reduce((acc, item) => acc + item.taxAmount, 0).toFixed(2));
  const rawTotal = Math.max(0, subtotal - overallDiscount);
  const grandTotal = Math.round(rawTotal);
  const itemCount = cart.length;

  const holdCurrentSale = (customerName: string = 'Walk-in Guest') => {
    if (cart.length === 0) return;
    const newHeld = {
      id: `hold-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName,
      items: [...cart],
      grandTotal
    };
    setHeldSales(prev => [newHeld, ...prev]);
    clearCart();
  };

  const recallHeldSale = (heldId: string) => {
    const found = heldSales.find(h => h.id === heldId);
    if (found) {
      setCart(found.items);
      setHeldSales(prev => prev.filter(h => h.id !== heldId));
      setIsHeldModalOpen(false);
    }
  };

  const processCheckout = async (
    payments: PaymentItem[],
    customerName: string = 'Walk-in Guest',
    customerPhone: string = ''
  ): Promise<Sale> => {
    const sale = await api.checkoutSale({
      storeId: currentShift.storeId,
      shiftId: currentShift.id,
      items: cart,
      payments,
      customer: { name: customerName, phone: customerPhone },
      overallDiscount
    });

    // Update local shift totals
    setCurrentShift(prev => {
      let cashAdd = 0;
      let cardAdd = 0;
      let upiAdd = 0;
      payments.forEach(p => {
        if (p.method === 'CASH') cashAdd += p.amount;
        if (p.method === 'CARD') cardAdd += p.amount;
        if (p.method === 'UPI') upiAdd += p.amount;
      });

      return {
        ...prev,
        totalSalesAmount: prev.totalSalesAmount + sale.grandTotal,
        cashSalesAmount: prev.cashSalesAmount + cashAdd,
        cardSalesAmount: prev.cardSalesAmount + cardAdd,
        upiSalesAmount: prev.upiSalesAmount + upiAdd,
        expectedCash: prev.expectedCash + cashAdd,
        totalTransactions: prev.totalTransactions + 1
      };
    });

    // Deduct local product stock preview
    setProducts(prev => prev.map(p => {
      const soldItem = cart.find(ci => ci.productId === p.id);
      if (soldItem) {
        return { ...p, current_stock: Math.max(0, p.current_stock - soldItem.weightKg) };
      }
      return p;
    }));

    setLastCompletedSale(sale);
    clearCart();
    setIsPaymentModalOpen(false);
    setIsReceiptModalOpen(true);
    return sale;
  };

  const updateOrderStatus = (orderId: string, newStatus: OnlineOrder['status']) => {
    setOnlineOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated = { ...o, status: newStatus };
        if (activeTrackingOrder && activeTrackingOrder.id === orderId) {
          setActiveTrackingOrder(updated);
        }
        return updated;
      }
      return o;
    }));
  };

  // Customer Storefront Cart & Orders
  const addCustomerCartItem = (product: Product, weightKg: number, cutType: string, cookingRecommendation?: string, specialNotes?: string) => {
    const itemSubtotal = parseFloat((product.selling_price * weightKg).toFixed(2));
    const newItem: CustomerCartItem = {
      id: 'cust-item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      productId: product.id,
      productName: product.name,
      localName: product.local_name,
      imageUrl: product.image_url,
      cutType,
      weightKg,
      unitPrice: product.selling_price,
      subtotal: itemSubtotal,
      cookingRecommendation,
      specialNotes
    };
    setCustomerCart(prev => [...prev, newItem]);
  };

  const removeCustomerCartItem = (id: string) => {
    setCustomerCart(prev => prev.filter(i => i.id !== id));
  };

  const updateCustomerCartItemWeight = (id: string, weightKg: number) => {
    setCustomerCart(prev => prev.map(i => {
      if (i.id === id) {
        return {
          ...i,
          weightKg,
          subtotal: parseFloat((i.unitPrice * weightKg).toFixed(2))
        };
      }
      return i;
    }));
  };

  const clearCustomerCart = () => {
    setCustomerCart([]);
  };

  const customerCartSubtotal = customerCart.reduce((sum, item) => sum + item.subtotal, 0);
  const customerCartItemCount = customerCart.length;

  const placeCustomerOnlineOrder = async (orderData: {
    customerName: string;
    customerPhone: string;
    deliveryType: 'HOME_DELIVERY' | 'STORE_PICKUP';
    deliveryAddress?: string;
    deliverySlot?: string;
    specialInstructions?: string;
    paymentMethod: string;
  }): Promise<OnlineOrder> => {
    const subtotal = customerCartSubtotal;
    const deliveryFee = orderData.deliveryType === 'HOME_DELIVERY' ? (subtotal >= 500 ? 0 : 40) : 0;
    const taxAmount = parseFloat((subtotal * 0.05).toFixed(2));
    const grandTotal = parseFloat((subtotal + deliveryFee + taxAmount).toFixed(2));

    const newOrderNumber = `ONL-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOnlineOrder: OnlineOrder = {
      id: 'order-' + Date.now(),
      orderNumber: newOrderNumber,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      deliveryType: orderData.deliveryType,
      deliveryAddress: orderData.deliveryAddress,
      deliverySlot: orderData.deliverySlot,
      specialInstructions: orderData.specialInstructions,
      paymentMethod: orderData.paymentMethod,
      status: 'PENDING',
      subtotal,
      deliveryFee,
      taxAmount,
      grandTotal,
      isPaid: orderData.paymentMethod !== 'COD' && orderData.paymentMethod !== 'PAY_ON_PICKUP',
      items: customerCart.map(item => ({
        productId: item.productId,
        productName: item.productName,
        cutType: item.cutType,
        requestedWeightKg: item.weightKg,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal
      })),
      createdAt: new Date().toISOString()
    };

    // Update state & stock reservations
    setOnlineOrders(prev => [newOnlineOrder, ...prev]);
    setActiveTrackingOrder(newOnlineOrder);
    clearCustomerCart();

    // Call API (async fallback)
    try {
      await api.createOnlineOrder({
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        delivery_type: orderData.deliveryType,
        delivery_address: orderData.deliveryAddress,
        delivery_slot: orderData.deliverySlot,
        special_instructions: orderData.specialInstructions,
        items: newOnlineOrder.items.map(it => ({
          product_id: it.productId,
          cut_type: it.cutType,
          requested_weight_kg: it.requestedWeightKg
        }))
      });
    } catch (err) {
      console.warn("Backend API sync fallback, local state updated:", err);
    }

    return newOnlineOrder;
  };

  return (
    <POSContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        currentRegister,
        loginUser,
        loginAsCustomer,
        logoutUser,
        switchRoleDemo,
        companies,
        branches,
        activeCompany,
        activeBranch,
        setActiveCompany,
        setActiveBranch,
        reloadCompaniesAndBranches,
        isRoleLoading,
        loadingRole,
        loadingRoleFullName,
        loadingRoleTerminal,
        dismissRoleLoading,
        currentCustomer,
        registerCustomerAccount,
        loginCustomerAccountWithPhone,
        logoutCustomerAccount,
        rolePermissionsMatrix,
        hasPermission,
        isRolePermissionsModalOpen,
        setIsRolePermissionsModalOpen,
        isRoleSwitcherModalOpen,
        setIsRoleSwitcherModalOpen,
        activeTab,
        setActiveTab,
        products,
        categories,
        selectedCategoryId,
        setSelectedCategoryId,
        searchQuery,
        setSearchQuery,
        addProduct,
        updateProductItem,
        deleteProductItem,
        updateProductPriceItem,
        bulkUpdatePricesList,
        reloadProducts,
        addCategoryItem,
        updateCategoryItem,
        deleteCategoryItem,
        reloadCategories,
        cart,
        addToCart,
        removeFromCart,
        updateCartItemWeight,
        clearCart,
        subtotal,
        taxAmount,
        overallDiscount,
        setOverallDiscount,
        grandTotal,
        itemCount,
        activeProductForWeight,
        openWeightModal,
        closeWeightModal,
        isPaymentModalOpen,
        openPaymentModal: () => setIsPaymentModalOpen(true),
        closePaymentModal: () => setIsPaymentModalOpen(false),
        isReceiptModalOpen,
        lastCompletedSale,
        closeReceiptModal: () => setIsReceiptModalOpen(false),
        heldSales,
        holdCurrentSale,
        recallHeldSale,
        isHeldModalOpen,
        setIsHeldModalOpen,
        currentShift,
        onlineOrders,
        updateOrderStatus,
        customerCart,
        addCustomerCartItem,
        removeCustomerCartItem,
        updateCustomerCartItemWeight,
        clearCustomerCart,
        customerCartSubtotal,
        customerCartItemCount,
        activeTrackingOrder,
        setActiveTrackingOrder,
        placeCustomerOnlineOrder,
        processCheckout
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) throw new Error('usePOS must be used within a POSProvider');
  return context;
};
