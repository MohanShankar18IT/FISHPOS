import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { FishImage } from '../common/FishImage';
import {
  XIcon,
  TrashIcon,
  ShoppingCartIcon,
  TruckIcon,
  ArrowRightIcon
} from '../common/Icons';

interface CustomerCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: () => void;
}

export const CustomerCartDrawer: React.FC<CustomerCartDrawerProps> = ({
  isOpen,
  onClose,
  onOrderPlaced
}) => {
  const {
    customerCart,
    removeCustomerCartItem,
    updateCustomerCartItemWeight,
    customerCartSubtotal,
    customerCartItemCount,
    placeCustomerOnlineOrder,
    currentCustomer
  } = usePOS();

  // Delivery & Customer Details
  const [deliveryType, setDeliveryType] = useState<'HOME_DELIVERY' | 'STORE_PICKUP'>('HOME_DELIVERY');
  const [customerName, setCustomerName] = useState<string>(currentCustomer?.name || 'Priya Sundaram');
  const [customerPhone, setCustomerPhone] = useState<string>(currentCustomer?.phone || '9840123456');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    currentCustomer?.address || 'Flat 4B, Greenview Enclave, DB Road, RS Puram, Coimbatore - 641002'
  );
  const [deliverySlot, setDeliverySlot] = useState<string>('⚡ Express Delivery (Within 35 Mins)');
  const [specialInstructions, setSpecialInstructions] = useState<string>('Please pack in leak-proof insulated bag with extra ice.');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  React.useEffect(() => {
    if (currentCustomer) {
      setCustomerName(currentCustomer.name);
      setCustomerPhone(currentCustomer.phone);
      if (currentCustomer.address) setDeliveryAddress(currentCustomer.address);
    }
  }, [currentCustomer, isOpen]);

  if (!isOpen) return null;

  const deliveryFee = deliveryType === 'HOME_DELIVERY' ? (customerCartSubtotal >= 500 ? 0 : 40) : 0;
  const taxAmount = parseFloat((customerCartSubtotal * 0.05).toFixed(2));
  const grandTotal = parseFloat((customerCartSubtotal + deliveryFee + taxAmount).toFixed(2));

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customerCart.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please enter customer name and contact phone number");
      return;
    }
    if (deliveryType === 'HOME_DELIVERY' && !deliveryAddress.trim()) {
      alert("Please enter your complete delivery address");
      return;
    }

    setIsSubmitting(true);
    try {
      await placeCustomerOnlineOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryType,
        deliveryAddress: deliveryType === 'HOME_DELIVERY' ? deliveryAddress.trim() : undefined,
        deliverySlot,
        specialInstructions: specialInstructions.trim() || undefined,
        paymentMethod
      });
      setIsSubmitting(false);
      onClose();
      onOrderPlaced();
    } catch (err) {
      console.error("Order placement failed:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 280
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '520px',
        height: '100%',
        background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
        animation: 'slideInRight 0.25s ease'
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingCartIcon size={22} className="text-sky-400" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                Your Seafood Cart
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {customerCartItemCount} Fresh catch {customerCartItemCount === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {customerCart.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ fontSize: '3rem' }}>🎣</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                Your seafood bag is empty!
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Browse our fresh harbor catch and choose your customized cuts.
              </p>
              <button
                onClick={onClose}
                style={{
                  marginTop: '10px',
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Browse Fresh Fish
              </button>
            </div>
          ) : (
            <>
              {/* Line Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Selected Fish & Cuts
                </span>

                {customerCart.map(item => (
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          border: '1px solid var(--border-subtle)',
                          flexShrink: 0
                        }}>
                          <FishImage
                            src={item.imageUrl}
                            alt={item.productName}
                            fallbackIconSize={20}
                            borderRadius="var(--radius-sm)"
                          />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                            {item.productName}
                          </h4>
                          {item.localName && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                              {item.localName}
                            </span>
                          )}
                          <div style={{ marginTop: '3px' }}>
                            <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                              🔪 {item.cutType}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeCustomerCartItem(item.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--accent-rose)',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        title="Remove item"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>

                    {item.specialNotes && (
                      <p style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', fontStyle: 'italic' }}>
                        Note: {item.specialNotes}
                      </p>
                    )}

                    {/* Weight Controls & Line Subtotal */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      paddingTop: '6px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Weight:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => updateCustomerCartItemWeight(item.id, Math.max(0.25, item.weightKg - 0.25))}
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
                              justifyContent: 'center',
                              fontWeight: 700
                            }}
                          >
                            -
                          </button>
                          <span className="mono-num" style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                            {item.weightKg.toFixed(3)} KG
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCustomerCartItemWeight(item.id, item.weightKg + 0.25)}
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
                              justifyContent: 'center',
                              fontWeight: 700
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="mono-num" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                        ₹{item.subtotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fulfillment Mode Toggle */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Fulfillment Mode
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('HOME_DELIVERY')}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${deliveryType === 'HOME_DELIVERY' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      background: deliveryType === 'HOME_DELIVERY' ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-input)',
                      color: deliveryType === 'HOME_DELIVERY' ? '#ffffff' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <TruckIcon size={16} />
                    <span>Home Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('STORE_PICKUP')}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${deliveryType === 'STORE_PICKUP' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      background: deliveryType === 'STORE_PICKUP' ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-input)',
                      color: deliveryType === 'STORE_PICKUP' ? '#ffffff' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🏪 Express Store Pickup</span>
                  </button>
                </div>
              </div>

              {/* Customer & Address Form */}
              <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: '#ffffff',
                        padding: '6px 10px',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: '#ffffff',
                        padding: '6px 10px',
                        fontSize: '0.8rem',
                        fontFamily: 'var(--font-mono)'
                      }}
                    />
                  </div>
                </div>

                {deliveryType === 'HOME_DELIVERY' && (
                  <>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                        Delivery Address & Landmark *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          color: '#ffffff',
                          padding: '6px 10px',
                          fontSize: '0.8rem',
                          resize: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                        Preferred Delivery Slot
                      </label>
                      <select
                        value={deliverySlot}
                        onChange={(e) => setDeliverySlot(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          color: '#ffffff',
                          padding: '6px 10px',
                          fontSize: '0.8rem'
                        }}
                      >
                        <option value="⚡ Express Delivery (Within 35 Mins)">⚡ Express Delivery (Within 35 Mins)</option>
                        <option value="🌅 Early Morning Slot (7:00 AM - 9:00 AM)">🌅 Early Morning Slot (7:00 AM - 9:00 AM)</option>
                        <option value="☀️ Midday Lunch Slot (11:00 AM - 1:00 PM)">☀️ Midday Lunch Slot (11:00 AM - 1:00 PM)</option>
                        <option value="🌆 Evening Fresh Slot (5:00 PM - 7:00 PM)">🌆 Evening Fresh Slot (5:00 PM - 7:00 PM)</option>
                      </select>
                    </div>
                  </>
                )}

                {deliveryType === 'STORE_PICKUP' && (
                  <div style={{ background: 'var(--bg-input)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-cyan)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>
                      🏪 Meanomeen Main Chiller Hub, Coimbatore
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      142, DB Road, RS Puram, Coimbatore - 641002. Ready in 15 mins.
                    </div>
                  </div>
                )}

                {/* Packaging note */}
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    Packaging Instruction
                  </label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ffffff',
                      padding: '6px 10px',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>

                {/* Payment Selection */}
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Payment Mode
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                    {[
                      { id: 'UPI', label: '📱 Instant UPI' },
                      { id: 'CARD', label: '💳 Cards / Net' },
                      { id: 'COD', label: deliveryType === 'HOME_DELIVERY' ? '💵 Cash on Delivery' : '💵 Pay at Pickup' },
                    ].map(pm => {
                      const isSel = paymentMethod === pm.id;
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id)}
                          style={{
                            padding: '8px 4px',
                            borderRadius: 'var(--radius-sm)',
                            border: `1px solid ${isSel ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                            background: isSel ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-input)',
                            color: isSel ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                            fontWeight: isSel ? 700 : 500,
                            fontSize: '0.72rem',
                            cursor: 'pointer'
                          }}
                        >
                          {pm.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </form>

              {/* Price Breakdown Bill Summary */}
              <div style={{
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Items Subtotal</span>
                  <span className="mono-num">₹{customerCartSubtotal.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Delivery Fee</span>
                  <span className="mono-num">
                    {deliveryFee === 0 ? <strong style={{ color: 'var(--accent-emerald)' }}>FREE</strong> : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                {customerCartSubtotal < 500 && deliveryType === 'HOME_DELIVERY' && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
                    💡 Add ₹{(500 - customerCartSubtotal).toFixed(2)} more seafood for FREE Delivery!
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Seafood GST (5%)</span>
                  <span className="mono-num">₹{taxAmount.toFixed(2)}</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--accent-emerald)',
                  borderTop: '1px dashed var(--border-subtle)',
                  paddingTop: '8px',
                  marginTop: '2px'
                }}>
                  <span>To Pay</span>
                  <span className="mono-num">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer CTA */}
        {customerCart.length > 0 && (
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.02)'
          }}>
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--accent-emerald)',
                border: 'none',
                color: '#000000',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              <span>{isSubmitting ? 'Confirming Catch...' : `Place Seafood Order • ₹${grandTotal.toFixed(2)}`}</span>
              <ArrowRightIcon size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
