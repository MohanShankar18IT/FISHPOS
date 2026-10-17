import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product, UnitType, ProductPriceHistoryRecord } from '../../types';
import { api } from '../../services/api';
import { CategoryMasterModal } from './CategoryMasterModal';

import { FishImage } from '../common/FishImage';

// High Clarity Fish Photo Presets for quick selection & preview
const FISH_PHOTO_PRESETS = [
  { name: 'Seer Fish / Vanjaram', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80' },
  { name: 'White Pomfret / Vawval', url: 'https://images.unsplash.com/photo-1534043464124-3be32fe00099?w=800&auto=format&fit=crop&q=80' },
  { name: 'Tiger Prawns (Medium-Large)', url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop&q=80' },
  { name: 'Freshwater Rohu / Kendai', url: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800&auto=format&fit=crop&q=80' },
  { name: 'Indian Sardine / Mathi', url: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&auto=format&fit=crop&q=80' },
  { name: 'Blue Sea Crab / Nandu', url: 'https://images.unsplash.com/photo-1559737558-2453c5188f61?w=800&auto=format&fit=crop&q=80' },
  { name: 'Atlantic Salmon Fillet', url: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&auto=format&fit=crop&q=80' },
  { name: 'Cuttlefish / Squid Rings', url: 'https://images.unsplash.com/photo-1548812391-766723223049?w=800&auto=format&fit=crop&q=80' },
  { name: 'Red Snapper / Sankara', url: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=800&auto=format&fit=crop&q=80' },
  { name: 'Black Pomfret / Vawval', url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80' },
  { name: 'Indian Mackerel / Ayala', url: 'https://images.unsplash.com/photo-1510130387422-82ebd332a64e?w=800&auto=format&fit=crop&q=80' },
  { name: 'Rock Lobster / Singi Eral', url: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=800&auto=format&fit=crop&q=80' },
  { name: 'Yellowfin Tuna / Parai', url: 'https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?w=800&auto=format&fit=crop&q=80' },
  { name: 'Anchovy / Nethili', url: 'https://images.unsplash.com/photo-1535400255456-984241443b29?w=800&auto=format&fit=crop&q=80' }
];

const STANDARD_CUT_OPTIONS = [
  'Whole',
  'Curry Cut',
  'Steaks / Slices',
  'Fillet (Boneless)',
  'Cleaned & Gutted',
  'Head Separate',
  'Peeled & Deveined',
  'Tail-on Cleaned',
  'Butterflied',
  'Fingers Cut'
];

export const ProductMaster: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProductItem,
    deleteProductItem,
    updateProductPriceItem,
    bulkUpdatePricesList
  } = usePOS();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'INACTIVE'>('ALL');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');
  const [sortBy, setSortBy] = useState<'NAME' | 'PRICE_ASC' | 'PRICE_DESC' | 'MARGIN' | 'STOCK'>('NAME');

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBulkPricingOpen, setIsBulkPricingOpen] = useState(false);
  const [isPriceAuditOpen, setIsPriceAuditOpen] = useState(false);
  const [priceAuditProduct, setPriceAuditProduct] = useState<Product | null>(null);
  const [priceAuditHistory, setPriceAuditHistory] = useState<ProductPriceHistoryRecord[]>([]);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [labelProduct, setLabelProduct] = useState<Product | null>(null);

  // Quick Price Revision State
  const [quickNewPrice, setQuickNewPrice] = useState<string>('');
  const [quickPriceReason, setQuickPriceReason] = useState<string>('');
  const [isSubmittingPrice, setIsSubmittingPrice] = useState(false);

  // Bulk Price Matrix State
  const [bulkCategoryFilter, setBulkCategoryFilter] = useState('ALL');
  const [bulkAdjustmentType, setBulkAdjustmentType] = useState<'PERCENT' | 'FLAT'>('PERCENT');
  const [bulkAdjustmentValue, setBulkAdjustmentValue] = useState<number>(5);
  const [bulkReason, setBulkReason] = useState('Morning Harbor Catch Arrival Rate Adjustment');
  const [bulkItems, setBulkItems] = useState<{ id: string; name: string; costPrice: number; oldPrice: number; newPrice: number }[]>([]);

  // Product Form State
  const [formData, setFormData] = useState<{
    sku: string;
    barcode: string;
    name: string;
    local_name: string;
    scientific_name: string;
    category_id: string;
    unit_type: UnitType;
    selling_price: number;
    cost_price: number;
    tax_rate: number;
    cut_options: string[];
    min_stock_alert: number;
    is_online_listed: boolean;
    image_url: string;
    current_stock: number;
    is_active: boolean;
  }>({
    sku: '',
    barcode: '',
    name: '',
    local_name: '',
    scientific_name: '',
    category_id: categories[0]?.id || 'cat-sea',
    unit_type: 'KG',
    selling_price: 0,
    cost_price: 0,
    tax_rate: 5.0,
    cut_options: ['Whole', 'Curry Cut', 'Steaks / Slices', 'Cleaned & Gutted'],
    min_stock_alert: 5.0,
    is_online_listed: true,
    image_url: '',
    current_stock: 0,
    is_active: true
  });
  const [customCutTag, setCustomCutTag] = useState('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [alertBanner, setAlertBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // ----------------------------------------------------
  // Computed KPI Metrics
  // ----------------------------------------------------
  const kpis = useMemo(() => {
    const totalActive = products.filter(p => p.is_active).length;
    const onlineListed = products.filter(p => p.is_active && p.is_online_listed).length;
    const lowStock = products.filter(p => p.is_active && p.current_stock <= p.min_stock_alert).length;
    
    // Average Gross Profit Margin %
    const validMargins = products
      .filter(p => p.is_active && p.selling_price > 0 && p.cost_price > 0)
      .map(p => ((p.selling_price - p.cost_price) / p.selling_price) * 100);
    const avgMargin = validMargins.length > 0
      ? validMargins.reduce((a, b) => a + b, 0) / validMargins.length
      : 0;

    return {
      totalActive,
      onlineListed,
      lowStock,
      avgMargin: avgMargin.toFixed(1)
    };
  }, [products]);

  // ----------------------------------------------------
  // Filtered & Sorted Products
  // ----------------------------------------------------
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchLocal = p.local_name ? p.local_name.toLowerCase().includes(q) : false;
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchBarcode = p.barcode ? p.barcode.toLowerCase().includes(q) : false;
        if (!matchName && !matchLocal && !matchSku && !matchBarcode) return false;
      }

      // Category filter
      if (selectedCatFilter !== 'ALL' && p.category_id !== selectedCatFilter) {
        return false;
      }

      // Stock status filter
      if (stockStatusFilter === 'IN_STOCK' && (!p.is_active || p.current_stock <= p.min_stock_alert)) return false;
      if (stockStatusFilter === 'LOW_STOCK' && (!p.is_active || p.current_stock > p.min_stock_alert)) return false;
      if (stockStatusFilter === 'INACTIVE' && p.is_active) return false;

      // Online only filter
      if (onlineOnly && !p.is_online_listed) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'NAME') return a.name.localeCompare(b.name);
      if (sortBy === 'PRICE_ASC') return a.selling_price - b.selling_price;
      if (sortBy === 'PRICE_DESC') return b.selling_price - a.selling_price;
      if (sortBy === 'MARGIN') {
        const marginA = a.selling_price > 0 ? ((a.selling_price - a.cost_price) / a.selling_price) : 0;
        const marginB = b.selling_price > 0 ? ((b.selling_price - b.cost_price) / b.selling_price) : 0;
        return marginB - marginA;
      }
      if (sortBy === 'STOCK') return b.current_stock - a.current_stock;
      return 0;
    });
  }, [products, searchTerm, selectedCatFilter, stockStatusFilter, onlineOnly, sortBy]);

  // ----------------------------------------------------
  // Handlers for Add / Edit Modal
  // ----------------------------------------------------
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      sku: `FISH-${Date.now().toString().slice(-4)}`,
      barcode: `890${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      local_name: '',
      scientific_name: '',
      category_id: categories.find(c => c.id !== 'cat-all')?.id || categories[0]?.id || 'cat-sea',
      unit_type: 'KG',
      selling_price: 0,
      cost_price: 0,
      tax_rate: 5.0,
      cut_options: ['Whole', 'Curry Cut', 'Steaks / Slices', 'Cleaned & Gutted'],
      min_stock_alert: 5.0,
      is_online_listed: true,
      image_url: FISH_PHOTO_PRESETS[0].url,
      current_stock: 10.0,
      is_active: true
    });
    setAlertBanner(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      barcode: p.barcode || '',
      name: p.name,
      local_name: p.local_name || '',
      scientific_name: p.scientific_name || '',
      category_id: p.category_id,
      unit_type: p.unit_type,
      selling_price: p.selling_price,
      cost_price: p.cost_price,
      tax_rate: p.tax_rate,
      cut_options: p.cut_options || [],
      min_stock_alert: p.min_stock_alert,
      is_online_listed: p.is_online_listed,
      image_url: p.image_url || '',
      current_stock: p.current_stock,
      is_active: p.is_active
    });
    setAlertBanner(null);
    setIsEditorOpen(true);
  };

  const handleToggleCutOption = (option: string) => {
    setFormData(prev => {
      const exists = prev.cut_options.includes(option);
      if (exists) {
        return { ...prev, cut_options: prev.cut_options.filter(c => c !== option) };
      } else {
        return { ...prev, cut_options: [...prev.cut_options, option] };
      }
    });
  };

  const handleAddCustomCut = () => {
    if (!customCutTag.trim()) return;
    if (!formData.cut_options.includes(customCutTag.trim())) {
      setFormData(prev => ({ ...prev, cut_options: [...prev.cut_options, customCutTag.trim()] }));
    }
    setCustomCutTag('');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      setAlertBanner({ type: 'error', message: 'Product Name and SKU are required!' });
      return;
    }
    setIsSavingProduct(true);
    try {
      if (editingProduct) {
        await updateProductItem(editingProduct.id, formData);
        setAlertBanner({ type: 'success', message: `Product "${formData.name}" updated successfully.` });
      } else {
        await addProduct(formData);
        setAlertBanner({ type: 'success', message: `New Product "${formData.name}" added to catalog.` });
      }
      setIsEditorOpen(false);
    } catch (err: any) {
      setAlertBanner({ type: 'error', message: err.message || 'Failed to save product.' });
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (p: Product) => {
    if (!window.confirm(`Are you sure you want to deactivate/archive "${p.name}"?`)) return;
    try {
      await deleteProductItem(p.id);
      setAlertBanner({ type: 'success', message: `Product "${p.name}" archived.` });
    } catch (err: any) {
      setAlertBanner({ type: 'error', message: err.message || 'Failed to archive product.' });
    }
  };

  // ----------------------------------------------------
  // Quick Price Revision & Audit History
  // ----------------------------------------------------
  const handleOpenPriceAudit = async (p: Product) => {
    setPriceAuditProduct(p);
    setQuickNewPrice(p.selling_price.toString());
    setQuickPriceReason('Morning Harbor Rate Adjustment');
    setIsPriceAuditOpen(true);
    try {
      const history = await api.getProductPriceHistory(p.id);
      setPriceAuditHistory(history);
    } catch {
      setPriceAuditHistory([]);
    }
  };

  const handleSavePriceRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceAuditProduct) return;
    const numPrice = parseFloat(quickNewPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      alert('Please enter a valid price amount');
      return;
    }

    setIsSubmittingPrice(true);
    try {
      await updateProductPriceItem(priceAuditProduct.id, numPrice, quickPriceReason);
      setAlertBanner({
        type: 'success',
        message: `Updated rate for ${priceAuditProduct.name} to ₹${numPrice.toFixed(2)}/${priceAuditProduct.unit_type}`
      });
      // Refresh history
      const updatedHistory = await api.getProductPriceHistory(priceAuditProduct.id);
      setPriceAuditHistory(updatedHistory);
      setIsPriceAuditOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update price');
    } finally {
      setIsSubmittingPrice(false);
    }
  };

  // ----------------------------------------------------
  // Daily Catch Bulk Price Matrix
  // ----------------------------------------------------
  const handleOpenBulkPricing = (categoryFilter = 'ALL') => {
    setBulkCategoryFilter(categoryFilter);
    const activeList = products.filter(p => p.is_active && (categoryFilter === 'ALL' || p.category_id === categoryFilter));
    setBulkItems(
      activeList.map(p => ({
        id: p.id,
        name: p.name,
        costPrice: p.cost_price,
        oldPrice: p.selling_price,
        newPrice: p.selling_price
      }))
    );
    setIsBulkPricingOpen(true);
  };

  const handleFilterBulkCategory = (catId: string) => {
    setBulkCategoryFilter(catId);
    const activeList = products.filter(p => p.is_active && (catId === 'ALL' || p.category_id === catId));
    setBulkItems(
      activeList.map(p => ({
        id: p.id,
        name: p.name,
        costPrice: p.cost_price,
        oldPrice: p.selling_price,
        newPrice: p.selling_price
      }))
    );
  };

  const handleApplyBulkFormula = () => {
    setBulkItems(prev =>
      prev.map(item => {
        let calculated = item.oldPrice;
        if (bulkAdjustmentType === 'PERCENT') {
          calculated = Math.round(item.oldPrice * (1 + bulkAdjustmentValue / 100));
        } else {
          calculated = Math.round(item.oldPrice + bulkAdjustmentValue);
        }
        return { ...item, newPrice: Math.max(1, calculated) };
      })
    );
  };

  const handleSaveBulkPrices = async () => {
    const payload = {
      items: bulkItems.map(b => ({ product_id: b.id, new_selling_price: b.newPrice })),
      reason: bulkReason
    };
    try {
      await bulkUpdatePricesList(payload);
      setAlertBanner({ type: 'success', message: `Bulk adjusted rates for ${bulkItems.length} products successfully.` });
      setIsBulkPricingOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to apply bulk prices');
    }
  };

  // ----------------------------------------------------
  // Barcode / Thermal Scale Label Generator Preview
  // ----------------------------------------------------
  const handleOpenLabelModal = (p: Product) => {
    setLabelProduct(p);
    setIsLabelModalOpen(true);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      height: '100%',
      overflowY: 'auto',
      paddingBottom: '24px'
    }}>
      {/* Alert Banner */}
      {alertBanner && (
        <div style={{
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          background: alertBanner.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${alertBanner.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: alertBanner.type === 'success' ? '#10b981' : '#ef4444',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <span>{alertBanner.type === 'success' ? '✓' : '⚠️'} {alertBanner.message}</span>
          <button
            onClick={() => setAlertBanner(null)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header & Fast Metric KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <div className="glass-panel" style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Active Seafood SKUs
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>
              {kpis.totalActive}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>catalog items</span>
          </div>
        </div>

        <div className="glass-panel" style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Average Gross Margin
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.7rem', fontWeight: 900, color: '#10b981' }}>
              {kpis.avgMargin}%
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>profit spread</span>
          </div>
        </div>

        <div className="glass-panel" style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Online Storefront Listed
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--primary)' }}>
              {kpis.onlineListed}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>e-commerce visible</span>
          </div>
        </div>

        <div className="glass-panel" style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Low Stock Alerts
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.7rem', fontWeight: 900, color: kpis.lowStock > 0 ? '#ef4444' : 'var(--text-muted)' }}>
              {kpis.lowStock}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>below min alert kg</span>
          </div>
        </div>
      </div>

      {/* Main Action Bar & Controls */}
      <div className="glass-panel" style={{
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Top Action Row: Search & Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '450px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by Name, Tamil Name (வஞ்சிரம்), SKU, or Barcode..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <span>📁</span>
              <span>Manage Categories</span>
            </button>

            <button
              onClick={() => handleOpenBulkPricing('ALL')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                background: 'rgba(245, 158, 11, 0.1)',
                color: '#f59e0b',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <span>⚡</span>
              <span>Daily Landing Rate Matrix</span>
            </button>

            <button
              onClick={handleOpenAdd}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--accent-cyan)',
                color: '#000000',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)'
              }}
            >
              <span>➕</span>
              <span>Add New Fish Variety</span>
            </button>
          </div>
        </div>

        {/* Filter Pills & View Mode Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '12px'
        }}>
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            <button
              onClick={() => setSelectedCatFilter('ALL')}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${selectedCatFilter === 'ALL' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                background: selectedCatFilter === 'ALL' ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-input)',
                color: selectedCatFilter === 'ALL' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              All Categories
            </button>
            {categories.filter(c => c.id !== 'cat-all').map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatFilter(cat.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${selectedCatFilter === cat.id ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                  background: selectedCatFilter === cat.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-input)',
                  color: selectedCatFilter === cat.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{cat.icon || '🐟'}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Secondary Filters & View Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Storefront only toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={onlineOnly}
                onChange={e => setOnlineOnly(e.target.checked)}
              />
              <span>Storefront Only</span>
            </label>

            {/* Stock Filter Dropdown */}
            <select
              value={stockStatusFilter}
              onChange={e => setStockStatusFilter(e.target.value as any)}
              style={{
                padding: '6px 10px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.78rem'
              }}
            >
              <option value="ALL">All Stock Levels</option>
              <option value="IN_STOCK">In Stock Only</option>
              <option value="LOW_STOCK">⚠️ Low Stock Alerts</option>
              <option value="INACTIVE">Archived / Inactive</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={{
                padding: '6px 10px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.78rem'
              }}
            >
              <option value="NAME">Sort by Name (A-Z)</option>
              <option value="PRICE_DESC">Price: High to Low</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="MARGIN">Profit Margin %</option>
              <option value="STOCK">Physical Stock Weight</option>
            </select>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', padding: '2px' }}>
              <button
                onClick={() => setViewMode('TABLE')}
                title="Table View"
                style={{
                  padding: '4px 8px',
                  background: viewMode === 'TABLE' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'TABLE' ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                ☰ Table
              </button>
              <button
                onClick={() => setViewMode('GRID')}
                title="Card Grid View"
                style={{
                  padding: '4px 8px',
                  background: viewMode === 'GRID' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'GRID' ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                ⊞ Cards
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Display: Table or Grid */}
      {filteredProducts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🐟</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>No fish varieties matched your filter</div>
          <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Try adjusting your search query or category filters</p>
        </div>
      ) : viewMode === 'TABLE' ? (
        /* ----------------------------------------------------
           Table View
        ---------------------------------------------------- */
        <div className="glass-panel" style={{
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Fish / Variety</th>
                <th style={{ padding: '12px 16px' }}>SKU & Barcode</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Available Cuts</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Cost Rate</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Selling Rate</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Margin %</th>
                <th style={{ padding: '12px 16px' }}>Stock in Chiller</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Online</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod, idx) => {
                const marginAmount = prod.selling_price - prod.cost_price;
                const marginPct = prod.selling_price > 0 ? (marginAmount / prod.selling_price) * 100 : 0;
                const isLow = prod.current_stock <= prod.min_stock_alert;

                return (
                  <tr
                    key={prod.id}
                    style={{
                      borderBottom: idx < filteredProducts.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      background: !prod.is_active ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* Fish Name & Image */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          border: '1px solid var(--border-subtle)',
                          flexShrink: 0
                        }}>
                          <FishImage
                            src={prod.image_url}
                            alt={prod.name}
                            fallbackIconSize={20}
                            borderRadius="var(--radius-md)"
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                            {prod.name}
                          </div>
                          {prod.local_name && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                              {prod.local_name}
                            </div>
                          )}
                          {prod.scientific_name && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              {prod.scientific_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* SKU & Barcode */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 700 }}>
                        {prod.sku}
                      </div>
                      {prod.barcode && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          🏷️ {prod.barcode}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        {prod.category_name || 'Seafood'}
                      </span>
                    </td>

                    {/* Available Cuts */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '200px' }}>
                        {prod.cut_options?.slice(0, 3).map(cut => (
                          <span
                            key={cut}
                            style={{
                              fontSize: '0.68rem',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: 'rgba(6, 182, 212, 0.1)',
                              color: 'var(--accent-cyan)',
                              fontWeight: 600
                            }}
                          >
                            {cut}
                          </span>
                        ))}
                        {(prod.cut_options?.length || 0) > 3 && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            +{prod.cut_options.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Cost Price */}
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      ₹{prod.cost_price.toFixed(2)}
                    </td>

                    {/* Selling Price */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '0.92rem' }}>
                          ₹{prod.selling_price.toFixed(2)}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          /{prod.unit_type}
                        </span>
                        <button
                          onClick={() => handleOpenPriceAudit(prod)}
                          title="Quick Price Update / Audit Log"
                          style={{
                            background: 'rgba(245, 158, 11, 0.15)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            color: '#f59e0b',
                            borderRadius: 'var(--radius-sm)',
                            padding: '2px 5px',
                            fontSize: '0.68rem',
                            cursor: 'pointer'
                          }}
                        >
                          ⚡
                        </button>
                      </div>
                    </td>

                    {/* Margin % */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        background: marginPct >= 25 ? 'rgba(16, 185, 129, 0.15)' : marginPct >= 15 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: marginPct >= 25 ? '#10b981' : marginPct >= 15 ? '#f59e0b' : '#ef4444'
                      }}>
                        {marginPct.toFixed(1)}%
                      </span>
                    </td>

                    {/* Stock in Chiller */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            color: isLow ? '#ef4444' : 'var(--text-primary)'
                          }}>
                            {prod.current_stock.toFixed(3)} {prod.unit_type}
                          </span>
                          {isLow && (
                            <span style={{ fontSize: '0.65rem', background: '#ef4444', color: '#fff', padding: '1px 4px', borderRadius: '3px', fontWeight: 800 }}>
                              LOW
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          Alert at: {prod.min_stock_alert.toFixed(1)} kg
                        </div>
                      </div>
                    </td>

                    {/* Online Listed */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: prod.is_online_listed ? '#10b981' : 'var(--text-muted)'
                      }}>
                        {prod.is_online_listed ? '✓ Storefront' : '—'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenLabelModal(prod)}
                          title="Print Barcode / Scale Sticker"
                          style={{
                            padding: '4px 8px',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          🏷️
                        </button>
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          title="Edit Full Specifications"
                          style={{
                            padding: '4px 10px',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod)}
                          title="Archive / Deactivate"
                          style={{
                            padding: '4px 8px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--radius-sm)',
                            color: '#ef4444',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ----------------------------------------------------
           Card Grid View
        ---------------------------------------------------- */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredProducts.map(prod => {
            const marginAmount = prod.selling_price - prod.cost_price;
            const marginPct = prod.selling_price > 0 ? (marginAmount / prod.selling_price) * 100 : 0;
            const isLow = prod.current_stock <= prod.min_stock_alert;

            return (
              <div
                key={prod.id}
                className="glass-panel"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                }}
              >
                {/* Card Header Image */}
                <div style={{ position: 'relative', height: '145px', background: 'var(--bg-main)', overflow: 'hidden' }}>
                  <FishImage
                    src={prod.image_url}
                    alt={prod.name}
                    fallbackIconSize={36}
                    borderRadius="0"
                  />
                  {/* Category Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}>
                    {prod.category_name || 'Seafood'}
                  </div>

                  {/* Stock Pill */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: isLow ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                    color: '#fff',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.7rem',
                    fontWeight: 800
                  }}>
                    {prod.current_stock.toFixed(2)} {prod.unit_type}
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {prod.name}
                      </h3>
                      <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {prod.sku}
                      </span>
                    </div>
                    {prod.local_name && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600, marginTop: '2px' }}>
                        {prod.local_name}
                      </div>
                    )}
                  </div>

                  {/* Cut Styles */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {prod.cut_options?.map(c => (
                      <span
                        key={c}
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* Price & Margin Matrix */}
                  <div style={{
                    marginTop: 'auto',
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Selling Rate</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
                        ₹{prod.selling_price.toFixed(2)}<span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>/{prod.unit_type}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Gross Margin</div>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: marginPct >= 25 ? '#10b981' : marginPct >= 15 ? '#f59e0b' : '#ef4444'
                      }}>
                        {marginPct.toFixed(1)}% (₹{marginAmount.toFixed(0)})
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px', gap: '8px', paddingTop: '4px' }}>
                    <button
                      onClick={() => handleOpenPriceAudit(prod)}
                      style={{
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        background: 'rgba(245, 158, 11, 0.1)',
                        color: '#f59e0b',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ⚡ Rate Audit
                    </button>
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      style={{
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ✏️ Edit Specs
                    </button>
                    <button
                      onClick={() => handleOpenLabelModal(prod)}
                      title="Print Barcode Label"
                      style={{
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      🏷️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------------------------------------------
          MODAL 1: Full Product Editor (Create & Edit)
      ---------------------------------------------------- */}
      {isEditorOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {editingProduct ? `✏️ Edit Seafood Product: ${editingProduct.name}` : '➕ Add New Seafood Variety'}
                </h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Catch-weight specifications, pricing margin, cut options & barcode rules
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveProduct} style={{ overflowY: 'auto', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Section 1: Basic Identifiers */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '10px' }}>
                  1. Product Identification & Naming
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Commercial Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Seer Fish / King Mackerel"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Local Name (Tamil / Regional)
                    </label>
                    <input
                      type="text"
                      value={formData.local_name}
                      onChange={e => setFormData(prev => ({ ...prev, local_name: e.target.value }))}
                      placeholder="e.g. வஞ்சிரம் மீன் (Vanjaram)"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Biological / Scientific Name
                    </label>
                    <input
                      type="text"
                      value={formData.scientific_name}
                      onChange={e => setFormData(prev => ({ ...prev, scientific_name: e.target.value }))}
                      placeholder="e.g. Scomberomorus commerson"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        fontStyle: 'italic'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      SKU Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                      placeholder="e.g. FISH-SEER-01"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Barcode / EAN-13
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        value={formData.barcode}
                        onChange={e => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                        placeholder="e.g. 8901001"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          fontFamily: 'monospace'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, barcode: `890${Math.floor(1000000 + Math.random() * 9000000)}` }))}
                        title="Auto Generate Barcode"
                        style={{
                          padding: '6px 10px',
                          background: 'var(--bg-main)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        ⚡ Gen
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Category *
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={e => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    >
                      {categories.filter(c => c.id !== 'cat-all').map(c => (
                        <option key={c.id} value={c.id}>
                          {c.icon || '🐟'} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Unit Type *
                    </label>
                    <select
                      value={formData.unit_type}
                      onChange={e => setFormData(prev => ({ ...prev, unit_type: e.target.value as UnitType }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="KG">KG (Catch Weight)</option>
                      <option value="GRAMS">Grams</option>
                      <option value="PIECE">Piece / Whole Unit</option>
                      <option value="PACKET">Pre-pack Box</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Pricing & Taxation */}
              <div style={{
                background: 'var(--bg-main)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '10px' }}>
                  2. Pricing, Costing & Profit Margin Simulator
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Cost Price (₹/{formData.unit_type}) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.cost_price}
                      onChange={e => setFormData(prev => ({ ...prev, cost_price: parseFloat(e.target.value) || 0 }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Selling Price (₹/{formData.unit_type}) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.selling_price}
                      onChange={e => setFormData(prev => ({ ...prev, selling_price: parseFloat(e.target.value) || 0 }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--accent-cyan)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--accent-cyan)',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      GST Tax Rate (%)
                    </label>
                    <select
                      value={formData.tax_rate}
                      onChange={e => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value={0}>0% (Exempted Fresh Fish)</option>
                      <option value={5}>5% (Standard Cleaned & Packed GST)</option>
                      <option value={12}>12% (Processed / Value Added)</option>
                      <option value={18}>18% (Canned / Exotic)</option>
                    </select>
                  </div>

                  {/* Realtime Margin Simulator Display */}
                  <div style={{
                    background: 'var(--bg-card)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Projected Margin</span>
                    {formData.selling_price > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{
                          fontSize: '1.1rem',
                          fontWeight: 900,
                          color: ((formData.selling_price - formData.cost_price) / formData.selling_price) >= 0.2 ? '#10b981' : '#f59e0b'
                        }}>
                          {(((formData.selling_price - formData.cost_price) / formData.selling_price) * 100).toFixed(1)}%
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          (₹{(formData.selling_price - formData.cost_price).toFixed(2)}/unit profit)
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enter prices</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Fish Cut Styles & Options */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  3. Supported Cutting & Dressing Options
                </div>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Cashiers and online customers will be prompted to select from these cuts during weighing:
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  {STANDARD_CUT_OPTIONS.map(opt => {
                    const isSelected = formData.cut_options.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleToggleCutOption(opt)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                          background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-input)',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>{isSelected ? '✓' : '+'}</span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Cut Adder */}
                <div style={{ display: 'flex', gap: '8px', maxWidth: '360px' }}>
                  <input
                    type="text"
                    value={customCutTag}
                    onChange={e => setCustomCutTag(e.target.value)}
                    placeholder="Add custom cut (e.g. Bone-in Steak)..."
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.78rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCut}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Add Cut
                  </button>
                </div>
              </div>

              {/* Section 4: Inventory & Online Storefront */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Min Stock Threshold Alert ({formData.unit_type})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.min_stock_alert}
                    onChange={e => setFormData(prev => ({ ...prev, min_stock_alert: parseFloat(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Initial Stock in Cold Storage ({formData.unit_type})
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.current_stock}
                    onChange={e => setFormData(prev => ({ ...prev, current_stock: parseFloat(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_online_listed}
                      onChange={e => setFormData(prev => ({ ...prev, is_online_listed: e.target.checked }))}
                    />
                    <span>Publish on Customer Storefront & Mobile App</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                    <span>Active Variety (Available at POS scale)</span>
                  </label>
                </div>
              </div>

              {/* Section 5: Fish Photo Presets */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Fish Variety Photo (Select High-Clarity Preset or Paste URL)
                  </label>
                  {formData.image_url && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      ✓ Photo Selected
                    </span>
                  )}
                </div>

                {/* Preset Photo Visual Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '8px',
                  maxHeight: '160px',
                  overflowY: 'auto',
                  padding: '8px',
                  background: 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '10px'
                }}>
                  {FISH_PHOTO_PRESETS.map((preset, i) => {
                    const isSelected = formData.image_url === preset.url;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image_url: preset.url }))}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 6px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1.5px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                          background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-card)',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                          fontSize: '0.7rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ width: '28px', height: '28px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                          <FishImage src={preset.url} alt={preset.name} fallbackIconSize={14} borderRadius="4px" />
                        </div>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {preset.name.split('/')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {formData.image_url && (
                    <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--accent-cyan)', flexShrink: 0 }}>
                      <FishImage src={formData.image_url} alt="Selected preview" fallbackIconSize={16} />
                    </div>
                  )}
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://... (or paste direct high-resolution image link)"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '16px'
              }}>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  style={{
                    padding: '8px 24px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: 'var(--accent-cyan)',
                    color: '#000000',
                    fontWeight: 800,
                    cursor: isSavingProduct ? 'wait' : 'pointer'
                  }}
                >
                  {isSavingProduct ? 'Saving Product...' : editingProduct ? 'Save Changes' : 'Create Product Master'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MODAL 2: Quick Price Revision & Immutable Audit Trail
      ---------------------------------------------------- */}
      {isPriceAuditOpen && priceAuditProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ⚡ Daily Catch Price Revision & Audit Trail
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  {priceAuditProduct.name} ({priceAuditProduct.local_name || priceAuditProduct.sku})
                </span>
              </div>
              <button
                onClick={() => setIsPriceAuditOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Live Rate Updater Box */}
              <form onSubmit={handleSavePriceRevision} style={{
                background: 'var(--bg-main)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b' }}>
                  Update Selling Rate Per {priceAuditProduct.unit_type}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Current Selling Rate
                    </label>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      ₹{priceAuditProduct.selling_price.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      New Selling Rate (₹/{priceAuditProduct.unit_type}) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={quickNewPrice}
                      onChange={e => setQuickNewPrice(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--accent-cyan)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--accent-cyan)',
                        fontSize: '1.1rem',
                        fontWeight: 900,
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Reason for Revision / Audit Note
                  </label>
                  <input
                    type="text"
                    required
                    value={quickPriceReason}
                    onChange={e => setQuickPriceReason(e.target.value)}
                    placeholder="e.g. Kasimedu harbor fresh arrival rate fluctuation"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsPriceAuditOpen(false)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPrice}
                    style={{
                      padding: '6px 18px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: 'var(--accent-cyan)',
                      color: '#000000',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: isSubmittingPrice ? 'wait' : 'pointer'
                    }}
                  >
                    {isSubmittingPrice ? 'Saving...' : 'Apply Live Rate'}
                  </button>
                </div>
              </form>

              {/* Price Audit Timeline */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Historical Price Audit Trail
                </div>

                {priceAuditHistory.length === 0 ? (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No prior price shifts recorded for this SKU.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {priceAuditHistory.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-main)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                              ₹{item.old_selling_price?.toFixed(2) || '0.00'}
                            </span>
                            <span>→</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                              ₹{item.new_selling_price?.toFixed(2)}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {item.reason || 'Price adjustment'}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          <div>{new Date(item.changed_at).toLocaleString()}</div>
                          <div>By: {item.changed_by || 'Store Manager'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MODAL 3: Daily Catch Bulk Landing Rate Matrix
      ---------------------------------------------------- */}
      {isBulkPricingOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ⚡ Morning Landing Rate Bulk Matrix
                </h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Bulk adjust harbor arrival rates across seafood categories in one click
                </p>
              </div>
              <button
                onClick={() => setIsBulkPricingOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Formula Tool */}
              <div style={{
                background: 'var(--bg-main)',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Category:
                </div>
                <select
                  value={bulkCategoryFilter}
                  onChange={e => handleFilterBulkCategory(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem'
                  }}
                >
                  <option value="ALL">All Categories</option>
                  {categories.filter(c => c.id !== 'cat-all').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginLeft: '8px' }}>
                  Adjustment:
                </div>
                <select
                  value={bulkAdjustmentType}
                  onChange={e => setBulkAdjustmentType(e.target.value as any)}
                  style={{
                    padding: '6px 10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem'
                  }}
                >
                  <option value="PERCENT">Percentage Hike / Cut (%)</option>
                  <option value="FLAT">Flat Rate Adjustment (₹)</option>
                </select>

                <input
                  type="number"
                  step="1"
                  value={bulkAdjustmentValue}
                  onChange={e => setBulkAdjustmentValue(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 5 or -10"
                  style={{
                    width: '80px',
                    padding: '6px 10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                />

                <button
                  type="button"
                  onClick={handleApplyBulkFormula}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Apply Formula
                </button>
              </div>

              {/* Bulk Table */}
              <div style={{
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px 14px' }}>Fish Variety</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Cost Price</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Current Rate</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>New Rate (Editable)</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>New Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkItems.map((item, idx) => {
                      const newMargin = item.newPrice > 0 ? ((item.newPrice - item.costPrice) / item.newPrice) * 100 : 0;
                      return (
                        <tr key={item.id} style={{ borderBottom: idx < bulkItems.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {item.name}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                            ₹{item.costPrice.toFixed(2)}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                            ₹{item.oldPrice.toFixed(2)}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                            <input
                              type="number"
                              step="1"
                              value={item.newPrice}
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 0;
                                setBulkItems(prev => prev.map(p => p.id === item.id ? { ...p, newPrice: val } : p));
                              }}
                              style={{
                                width: '100px',
                                padding: '4px 8px',
                                background: 'var(--bg-input)',
                                border: '1px solid var(--accent-cyan)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--accent-cyan)',
                                fontWeight: 800,
                                fontFamily: 'monospace',
                                textAlign: 'right',
                                fontSize: '0.85rem'
                              }}
                            />
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <span style={{
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              color: newMargin >= 20 ? '#10b981' : '#f59e0b'
                            }}>
                              {newMargin.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Audit Reason */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Bulk Adjustment Audit Reason *
                </label>
                <input
                  type="text"
                  required
                  value={bulkReason}
                  onChange={e => setBulkReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem'
                  }}
                />
              </div>
            </div>

            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                type="button"
                onClick={() => setIsBulkPricingOpen(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.82rem'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBulkPrices}
                style={{
                  padding: '8px 22px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--accent-cyan)',
                  color: '#000000',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Apply Rates to All {bulkItems.length} Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MODAL 4: Thermal Weighing Scale Barcode Label Preview
      ---------------------------------------------------- */}
      {isLabelModalOpen && labelProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '450px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                🏷️ Thermal Scale Sticker Preview
              </h3>
              <button
                onClick={() => setIsLabelModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Thermal Label Graphic Simulation */}
            <div style={{
              background: '#ffffff',
              color: '#000000',
              padding: '16px 20px',
              borderRadius: '6px',
              fontFamily: 'monospace',
              border: '2px dashed #9ca3af',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
            }}>
              <div style={{ textAlign: 'center', fontWeight: 900, fontSize: '0.95rem', borderBottom: '1px dashed #000', paddingBottom: '4px', textTransform: 'uppercase' }}>
                MeanOmeen Fresh Catch
              </div>
              <div style={{ fontSize: '0.65rem', textAlign: 'center', margin: '2px 0 6px' }}>
                Coimbatore Harbor Wholesales • FSSAI: 124230000001
              </div>

              <div style={{ margin: '8px 0', borderBottom: '1px solid #000', paddingBottom: '6px' }}>
                <div style={{ fontWeight: 900, fontSize: '0.95rem' }}>{labelProduct.name}</div>
                {labelProduct.local_name && (
                  <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{labelProduct.local_name}</div>
                )}
                <div style={{ fontSize: '0.68rem', marginTop: '2px' }}>SKU: {labelProduct.sku}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '0.75rem', marginBottom: '8px' }}>
                <div>Unit Rate: ₹{labelProduct.selling_price.toFixed(2)}/{labelProduct.unit_type}</div>
                <div>GST: {labelProduct.tax_rate}%</div>
                <div>Packed: {new Date().toLocaleDateString()}</div>
                <div>Scale: RS-232</div>
              </div>

              {/* Barcode Visual Lines */}
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <div style={{
                  height: '40px',
                  background: 'repeating-linear-gradient(90deg, #000, #000 2px, transparent 2px, transparent 4px, #000 4px, #000 7px, transparent 7px, transparent 9px)',
                  marginBottom: '2px'
                }} />
                <div style={{ fontSize: '0.75rem', letterSpacing: '3px', fontWeight: 700 }}>
                  {labelProduct.barcode || labelProduct.sku}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setIsLabelModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.82rem'
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                style={{
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--accent-cyan)',
                  color: '#000000',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                🖨️ Send to Scale Printer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MODAL 5: Category Master Modal
      ---------------------------------------------------- */}
      <CategoryMasterModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
};
