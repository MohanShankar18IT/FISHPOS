import React from 'react';
import { usePOS } from '../../context/POSContext';
import { SearchIcon, ScaleIcon, AlertTriangleIcon, XIcon } from '../common/Icons';
import { FishImage } from '../common/FishImage';

export const ProductGrid: React.FC = () => {
  const {
    products,
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    searchQuery,
    setSearchQuery,
    openWeightModal
  } = usePOS();

  // Filter products by category and search
  const filteredProducts = products.filter(product => {
    const matchesCategory =
      selectedCategoryId === 'cat-all' || product.category_id === selectedCategoryId;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      (product.local_name && product.local_name.toLowerCase().includes(query)) ||
      product.sku.toLowerCase().includes(query) ||
      (product.barcode && product.barcode.includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      flex: 1,
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Search & Category Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Search Bar */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '0 16px',
          height: '48px'
        }}>
          <SearchIcon size={20} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search fish by name, Tamil name (வஞ்சிரம்), SKU or barcode... [F2]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.95rem',
              marginLeft: '12px',
              fontWeight: 500
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <XIcon size={18} />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          {categories.map(cat => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  background: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? 'var(--shadow-glow)' : 'none'
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
        gap: '14px',
        paddingRight: '4px',
        alignContent: 'start'
      }}>
        {filteredProducts.map(product => {
          const isLowStock = product.current_stock <= product.min_stock_alert;
          const isOutOfStock = product.current_stock <= 0;

          return (
            <div
              key={product.id}
              onClick={() => !isOutOfStock && openWeightModal(product)}
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                opacity: isOutOfStock ? 0.55 : 1,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid var(--border-subtle)',
                position: 'relative',
                overflow: 'hidden',
                background: 'var(--bg-card)'
              }}
              onMouseEnter={(e) => {
                if (!isOutOfStock) {
                  e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(6, 182, 212, 0.18)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isOutOfStock) {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Product Visual Header */}
              <div style={{ position: 'relative', height: '120px', width: '100%', overflow: 'hidden' }}>
                <FishImage
                  src={product.image_url}
                  alt={product.name}
                  fallbackIconSize={32}
                  borderRadius="0"
                />

                {/* Overlay Category Tag */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(6px)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(6, 182, 212, 0.3)'
                }}>
                  {product.category_name || 'Seafood'}
                </div>

                {/* Stock Status Badge */}
                <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                  {isOutOfStock ? (
                    <span className="badge badge-rose" style={{ fontSize: '0.62rem', backdropFilter: 'blur(4px)' }}>
                      Sold Out
                    </span>
                  ) : isLowStock ? (
                    <span className="badge badge-amber" style={{ fontSize: '0.62rem', backdropFilter: 'blur(4px)' }}>
                      <AlertTriangleIcon size={10} /> Low Stock
                    </span>
                  ) : (
                    <span className="badge badge-emerald" style={{ fontSize: '0.62rem', backdropFilter: 'blur(4px)' }}>
                      Fresh
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {/* Product Info */}
                <div style={{ marginBottom: '10px' }}>
                  <h3 style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    lineHeight: '1.25',
                    marginBottom: '3px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {product.name}
                  </h3>
                  {product.local_name && (
                    <p style={{
                      fontSize: '0.78rem',
                      color: 'var(--accent-cyan)',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {product.local_name}
                    </p>
                  )}
                </div>

                {/* Price & Weight Action Button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Rate / {product.unit_type}
                    </span>
                    <div className="mono-num" style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-emerald)' }}>
                      ₹{product.selling_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <button
                    disabled={isOutOfStock}
                    title="Weigh & Add to Cart"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--primary)',
                      color: '#ffffff',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.15s'
                    }}
                  >
                    <ScaleIcon size={18} />
                  </button>
                </div>

                {/* Available Stock Footer */}
                <div style={{
                  marginTop: '8px',
                  fontSize: '0.7rem',
                  color: isLowStock ? 'var(--accent-amber)' : 'var(--text-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Chiller Stock:</span>
                  <strong className="mono-num" style={{ color: isOutOfStock ? 'var(--accent-rose)' : isLowStock ? 'var(--accent-amber)' : '#ffffff' }}>
                    {product.current_stock.toFixed(3)} {product.unit_type}
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
