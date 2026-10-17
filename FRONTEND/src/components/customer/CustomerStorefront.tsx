import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';
import { CustomerCutWeightModal } from './CustomerCutWeightModal';
import { CustomerCartDrawer } from './CustomerCartDrawer';
import { FishImage } from '../common/FishImage';
import {
  ShoppingCartIcon,
  SearchIcon,
  SparklesIcon,
  ShieldCheckIcon,
  MapPinIcon,
  TruckIcon,
  KnifeIcon,
  ClockIcon,
  ArrowRightIcon
} from '../common/Icons';

interface CustomerStorefrontProps {
  onGoToTracking: () => void;
}

export const CustomerStorefront: React.FC<CustomerStorefrontProps> = ({
  onGoToTracking
}) => {
  const {
    products,
    categories,
    customerCartSubtotal,
    customerCartItemCount,
    onlineOrders,
    currentCustomer,
    logoutCustomerAccount
  } = usePOS();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProductForModal, setActiveProductForModal] = useState<Product | null>(null);
  const [isCutModalOpen, setIsCutModalOpen] = useState<boolean>(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);

  // Filter products by category, online listing and search
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategoryId === 'ALL' || p.category_id === selectedCategoryId;
    const matchesSearch = !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.local_name && p.local_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.scientific_name && p.scientific_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleOpenCutModal = (product: Product) => {
    setActiveProductForModal(product);
    setIsCutModalOpen(true);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      flex: 1,
      height: '100%',
      overflowY: 'auto',
      paddingBottom: customerCartItemCount > 0 ? '80px' : '20px'
    }}>
      {/* Top Store Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'var(--bg-card)',
        padding: '12px 18px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Delivery Location & Customer Profile badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPinIcon size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Delivering To
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                {currentCustomer?.address ? currentCustomer.address.slice(0, 32) + '...' : 'RS Puram, Coimbatore'} <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>• ⚡ ~35 Mins</span>
              </div>
            </div>
          </div>

          {currentCustomer && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid var(--accent-emerald)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '0.85rem' }}>👤</span>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff' }}>
                  {currentCustomer.name} <span className="mono-num" style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>({currentCustomer.phone})</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--accent-amber)' }}>
                  ⭐ {currentCustomer.loyalty_points || 50} Loyalty Points Available
                </div>
              </div>
              <button
                type="button"
                onClick={logoutCustomerAccount}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  marginLeft: '4px',
                  textDecoration: 'underline'
                }}
                title="Switch customer account"
              >
                Switch
              </button>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onlineOrders.length > 0 && (
            <button
              onClick={onGoToTracking}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid var(--accent-cyan)',
                color: 'var(--accent-cyan)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <ClockIcon size={16} />
              <span>Track Orders ({onlineOrders.length})</span>
            </button>
          )}

          <button
            onClick={() => setIsCartDrawerOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-emerald)',
              border: 'none',
              color: '#000000',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.35)'
            }}
          >
            <ShoppingCartIcon size={17} />
            <span>Bag ({customerCartItemCount}) • ₹{customerCartSubtotal.toFixed(2)}</span>
          </button>
        </div>
      </div>

      {/* Hero Harbor Catch Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(30, 58, 138, 0.35) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
              <SparklesIcon size={12} /> TODAY'S FRESH BOAT CATCH
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              Fresh Daily from Cochin Harbor & Bhavanisagar Dam
            </span>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', marginTop: '6px', lineHeight: 1.2 }}>
            Sea-to-Kitchen Fresh Seafood, Custom Cut & Cleaned
          </h2>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '560px' }}>
            100% chemical & formalin-free. Select your preferred fish weight, and our master fishmongers will custom cut, descale and pack with flake ice.
          </p>

          <div style={{ display: 'flex', gap: '14px', marginTop: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
              <ShieldCheckIcon size={16} /> 100% Chemical-Free
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
              <KnifeIcon size={16} /> Free Custom Cuts & Descaling
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
              <TruckIcon size={16} /> Chilled Temperature Controlled Delivery
            </div>
          </div>
        </div>

        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '2px solid var(--accent-cyan)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '4rem',
          boxShadow: 'var(--shadow-glow)'
        }}>
          🐟
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-card)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            flex: 1,
            minWidth: '260px'
          }}>
            <SearchIcon size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search fish by English or Tamil name (e.g. Vanjaram, Sankara, Kaala, Prawns)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.85rem',
                marginLeft: '10px',
                outline: 'none',
                width: '100%'
              }}
            />
          </div>
        </div>

        {/* Category Chips */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            onClick={() => setSelectedCategoryId('ALL')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              border: `1px solid ${selectedCategoryId === 'ALL' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
              background: selectedCategoryId === 'ALL' ? 'var(--primary)' : 'var(--bg-card)',
              color: selectedCategoryId === 'ALL' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: selectedCategoryId === 'ALL' ? 800 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s'
            }}
          >
            🌊 All Fresh Catch ({products.length})
          </button>

          {categories.map(cat => {
            const isSelected = selectedCategoryId === cat.id;
            const count = products.filter(p => p.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                  background: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 800 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s'
                }}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Fresh Catch Seafood Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
            Fresh Catch Available in Store Chiller
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Showing {filteredProducts.length} seafood varieties
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '0',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden',
                transition: 'transform 0.15s, border-color 0.15s, box-shadow 0.15s',
                cursor: 'pointer'
              }}
              onClick={() => handleOpenCutModal(product)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                e.currentTarget.style.boxShadow = '0 10px 28px rgba(6, 182, 212, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Card Hero Image */}
              <div style={{ position: 'relative', height: '160px', width: '100%', overflow: 'hidden' }}>
                <FishImage
                  src={product.image_url}
                  alt={product.name}
                  fallbackIconSize={36}
                  borderRadius="0"
                />

                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(6px)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(6, 182, 212, 0.3)'
                }}>
                  {product.category_name || 'Fresh Catch'}
                </div>

                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem', backdropFilter: 'blur(4px)' }}>
                    Catch of Day ✓
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25 }}>
                    {product.name}
                  </h4>
                  {product.local_name && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 700, marginTop: '2px' }}>
                      {product.local_name}
                    </div>
                  )}

                  {/* Cut Options Preview Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                    {product.cut_options?.slice(0, 3).map((cut, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.65rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {cut}
                      </span>
                    ))}
                    {(product.cut_options?.length || 0) > 3 && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        +{product.cut_options.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Stock availability */}
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Chiller Stock:</span>
                    <span className="mono-num" style={{ fontSize: '0.78rem', fontWeight: 700, color: product.current_stock > 5 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                      {product.current_stock.toFixed(2)} KG Available
                    </span>
                  </div>
                </div>

                {/* Price & Custom Cut Action */}
                <div style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Price per KG</span>
                    <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-emerald)' }}>
                      ₹{product.selling_price.toFixed(2)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCutModal(product);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--primary)',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: 'var(--shadow-glow)'
                    }}
                  >
                    <KnifeIcon size={14} />
                    <span>Choose Cuts</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Bottom Cart Bar when items in cart */}
      {customerCartItemCount > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '560px',
          background: 'var(--accent-emerald)',
          borderRadius: 'var(--radius-xl)',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 150,
          cursor: 'pointer'
        }}
        onClick={() => setIsCartDrawerOpen(true)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#000000' }}>
            <ShoppingCartIcon size={20} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900 }}>
                {customerCartItemCount} Items Added
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                Click to review cuts & checkout
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#000000' }}>
            <span className="mono-num" style={{ fontSize: '1.2rem', fontWeight: 900 }}>
              ₹{customerCartSubtotal.toFixed(2)}
            </span>
            <div style={{
              background: '#000000',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 800,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>View Bag</span>
              <ArrowRightIcon size={14} />
            </div>
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <CustomerCutWeightModal
        product={activeProductForModal}
        isOpen={isCutModalOpen}
        onClose={() => setIsCutModalOpen(false)}
        onAddedToCart={() => setIsCartDrawerOpen(true)}
      />

      <CustomerCartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        onOrderPlaced={onGoToTracking}
      />
    </div>
  );
};
