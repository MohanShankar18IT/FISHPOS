import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { PaymentMethod, PaymentItem } from '../../types';
import { DollarIcon, QrCodeIcon, CheckCircleIcon, XIcon } from '../common/Icons';

export const PaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    closePaymentModal,
    grandTotal,
    processCheckout
  } = usePOS();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [tenderedAmount, setTenderedAmount] = useState<string>(grandTotal.toString());
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isPaymentModalOpen) return null;

  const numTendered = parseFloat(tenderedAmount) || 0;
  const changeDue = Math.max(0, numTendered - grandTotal);

  const quickDenominations = [100, 200, 500, 1000, 2000];

  const handleCompletePayment = async () => {
    setIsSubmitting(true);
    try {
      const paymentItem: PaymentItem = {
        method: paymentMethod,
        amount: grandTotal,
        tenderedAmount: paymentMethod === 'CASH' ? numTendered : grandTotal,
        changeDue: paymentMethod === 'CASH' ? changeDue : 0,
        transactionRef: transactionRef || (paymentMethod === 'UPI' ? `UPI-${Date.now().toString().slice(-6)}` : undefined)
      };

      await processCheckout([paymentItem], customerName, customerPhone);
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 10, 20, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 250,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '680px',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        background: 'var(--bg-card)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(16, 185, 129, 0.08)'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Finalize Settlement
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Payment Checkout</h2>
              <span className="mono-num badge badge-emerald" style={{ fontSize: '1rem', padding: '4px 12px' }}>
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={closePaymentModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <XIcon size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Payment Method Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { id: 'CASH' as const, label: 'Cash Tender', icon: DollarIcon },
              { id: 'UPI' as const, label: 'Instant UPI / QR', icon: QrCodeIcon },
              { id: 'CARD' as const, label: 'Card / POS POS', icon: CheckCircleIcon },
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = paymentMethod === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPaymentMethod(tab.id)}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-lg)',
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-input)',
                    border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={22} className={isSelected ? 'text-sky-400' : ''} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Cash Tender Interface */}
          {paymentMethod === 'CASH' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{
                  background: 'var(--bg-input)',
                  padding: '14px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--primary)'
                }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Cash Tendered (₹)
                  </span>
                  <input
                    type="number"
                    autoFocus
                    value={tenderedAmount}
                    onChange={(e) => setTenderedAmount(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono)',
                      marginTop: '4px'
                    }}
                  />
                </div>

                <div style={{
                  background: 'var(--bg-input)',
                  padding: '14px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Change Return Due
                  </span>
                  <div className="mono-num" style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: changeDue > 0 ? 'var(--accent-amber)' : 'var(--text-muted)',
                    marginTop: '4px'
                  }}>
                    ₹{changeDue.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Quick Note Presets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick Tender:</span>
                <button
                  onClick={() => setTenderedAmount(grandTotal.toString())}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Exact (₹{grandTotal.toFixed(0)})
                </button>
                {quickDenominations.map(denom => (
                  <button
                    key={denom}
                    onClick={() => setTenderedAmount(denom.toString())}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    + ₹{denom}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* UPI QR Display */}
          {paymentMethod === 'UPI' && (
            <div style={{
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around'
            }}>
              <div style={{
                background: '#ffffff',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-md)'
              }}>
                <QrCodeIcon size={120} className="text-slate-900" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="badge badge-cyan">Dynamic UPI QR Code</span>
                <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 700 }}>
                  Scan to Pay ₹{grandTotal.toFixed(2)}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Accepts Google Pay, PhonePe, Paytm, BHIM
                </p>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  VPA: meanomeen@upi • Webhook auto-verify active
                </div>
              </div>
            </div>
          )}

          {/* Card Reference */}
          {paymentMethod === 'CARD' && (
            <div style={{
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              border: '1px solid var(--border-subtle)'
            }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Card Approval / EDC Machine RRN Reference
              </label>
              <input
                type="text"
                placeholder="e.g. RRN-948271034"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          )}

          {/* Optional Customer Information */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Customer Name
              </label>
              <input
                type="text"
                placeholder="Walk-in Guest"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Customer Mobile (for WhatsApp Receipt)
              </label>
              <input
                type="tel"
                placeholder="+91 98400 xxxxx"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          background: 'var(--bg-input)'
        }}>
          <button
            onClick={closePaymentModal}
            style={{
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            disabled={isSubmitting || (paymentMethod === 'CASH' && numTendered < grandTotal)}
            onClick={handleCompletePayment}
            style={{
              padding: '12px 32px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircleIcon size={18} />
            <span>{isSubmitting ? 'Processing...' : 'Complete & Print Bill'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
