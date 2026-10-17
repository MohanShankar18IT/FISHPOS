import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { TrashIcon, PlusIcon, ShoppingCartIcon, DollarIcon } from '../common/Icons';
import { FishImage } from '../common/FishImage';

export const CartSidebar: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartItemWeight,
    clearCart,
    subtotal,
    taxAmount,
    overallDiscount,
    grandTotal,
    itemCount,
    openPaymentModal,
    holdCurrentSale
  } = usePOS();

  const [customerName, setCustomerName] = useState<string>('');

  const handleHold = () => {
    holdCurrentSale(customerName || 'Walk-in Customer');
    setCustomerName('');
  };

  return (
    <div className="glass-panel" style={{
      width: '380px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-subtle)',
      overflow: 'hidden',
      background: 'var(--bg-card)'
    }}>
      {/* Cart Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCartIcon size={18} className="text-sky-400" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Active Cart Bill</h2>
          <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {itemCount > 0 && (
          <button
            onClick={clearCart}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-rose)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <TrashIcon size={14} /> Clear
          </button>
        )}
      </div>

      {/* Optional Customer Tag */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-input)' }}>
        <input
          type="text"
          placeholder="Customer Name / Mobile (Optional)"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.8rem'
          }}
        />
      </div>

      {/* Cart Items List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {cart.length === 0 ? (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            textAlign: 'center',
            padding: '20px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--bg-input)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              color: 'var(--text-secondary)'
            }}>
              <ShoppingCartIcon size={26} />
            </div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Cart is currently empty
            </p>
            <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>
              Select a fish from catalog and place on digital scale.
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {/* Item Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-subtle)',
                    flexShrink: 0
                  }}>
                    <FishImage
                      src={item.imageUrl}
                      alt={item.name}
                      fallbackIconSize={18}
                      borderRadius="var(--radius-sm)"
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
                      {item.name}
                    </div>
                    {item.localName && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        {item.localName}
                      </div>
                    )}
                    <div style={{ display: 'inline-block', marginTop: '2px' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.62rem' }}>
                        {item.cutType}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px'
                  }}
                >
                  <TrashIcon size={14} />
                </button>
              </div>

              {/* Weight Adjustment & Subtotal */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '6px',
                borderTop: '1px dashed var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => updateCartItemWeight(item.id, Math.max(0.1, item.weightKg - 0.25))}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    -
                  </button>

                  <span className="mono-num" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', minWidth: '60px', textAlign: 'center' }}>
                    {item.weightKg.toFixed(3)} {item.unitType}
                  </span>

                  <button
                    onClick={() => updateCartItemWeight(item.id, item.weightKg + 0.25)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <PlusIcon size={12} />
                  </button>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="mono-num" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    ₹{item.subtotal.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    @ ₹{item.unitPrice.toFixed(2)} / {item.unitType}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Action Buttons */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Bill Calculations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span>Subtotal:</span>
            <span className="mono-num">₹{subtotal.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span>Tax (GST 5% included):</span>
            <span className="mono-num">₹{taxAmount.toFixed(2)}</span>
          </div>

          {overallDiscount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--accent-rose)' }}>
              <span>Special Discount:</span>
              <span className="mono-num">-₹{overallDiscount.toFixed(2)}</span>
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#ffffff',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)',
            marginTop: '2px'
          }}>
            <span>Total Payable:</span>
            <span className="mono-num" style={{ color: 'var(--accent-emerald)' }}>
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
          <button
            disabled={cart.length === 0}
            onClick={handleHold}
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            ⏸ Hold [F8]
          </button>

          <button
            disabled={cart.length === 0}
            onClick={openPaymentModal}
            style={{
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              background: cart.length === 0 ? 'var(--bg-elevated)' : 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.05rem',
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: cart.length > 0 ? '0 4px 14px rgba(16, 185, 129, 0.4)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <DollarIcon size={20} />
            <span>PAY / CHARGE [Space]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
