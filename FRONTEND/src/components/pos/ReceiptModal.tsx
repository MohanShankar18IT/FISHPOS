import React from 'react';
import { usePOS } from '../../context/POSContext';
import { PrinterIcon, CheckCircleIcon, XIcon } from '../common/Icons';

export const ReceiptModal: React.FC = () => {
  const { isReceiptModalOpen, closeReceiptModal, lastCompletedSale, currentShift } = usePOS();

  if (!isReceiptModalOpen || !lastCompletedSale) return null;

  const handlePrint = () => {
    window.print();
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
      zIndex: 300,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        background: 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(16, 185, 129, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircleIcon size={20} className="text-emerald-400" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>Sale Settled & Completed</h3>
          </div>
          <button
            onClick={closeReceiptModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Receipt Preview Paper */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          <div className="receipt-paper">
            {/* Store Header */}
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                <img src="/logo.jpg" alt="meanOmeen" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'contain' }} />
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                MEANOMEEN SEAFOOD
              </div>
              <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                Fresh Catch Retail & Online Hub
              </div>
              <div style={{ fontSize: '0.7rem', color: '#4b5563' }}>
                142, DB Road, RS Puram, Coimbatore - 641002
              </div>
              <div style={{ fontSize: '0.7rem', color: '#4b5563' }}>
                GSTIN: 33AAAAA0000A1Z5 • Ph: +91 98422 12345
              </div>
            </div>

            <div className="receipt-divider"></div>

            {/* Bill Meta */}
            <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Bill No: <strong>{lastCompletedSale.saleNumber}</strong></span>
                <span>Reg: {currentShift.registerNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Date: {new Date(lastCompletedSale.createdAt).toLocaleDateString()}</span>
                <span>Time: {new Date(lastCompletedSale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cashier: {lastCompletedSale.cashierName}</span>
                <span>Cust: {lastCompletedSale.customerName || 'Walk-in'}</span>
              </div>
            </div>

            <div className="receipt-double-divider"></div>

            {/* Items Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.75rem', marginBottom: '4px' }}>
              <span style={{ flex: 2 }}>ITEM / CUT</span>
              <span style={{ flex: 1, textAlign: 'center' }}>QTY (KG)</span>
              <span style={{ flex: 1, textAlign: 'right' }}>RATE</span>
              <span style={{ flex: 1, textAlign: 'right' }}>AMT (₹)</span>
            </div>
            <div className="receipt-divider"></div>

            {/* Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lastCompletedSale.items.map((item, idx) => (
                <div key={idx} style={{ fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 700 }}>
                    {item.name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', fontSize: '0.7rem' }}>
                    <span style={{ flex: 2 }}>[{item.cutType}]</span>
                    <span style={{ flex: 1, textAlign: 'center' }}>{item.weightKg.toFixed(3)}</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>{item.unitPrice.toFixed(0)}</span>
                    <span style={{ flex: 1, textAlign: 'right', fontWeight: 700, color: '#111827' }}>
                      {item.subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="receipt-divider"></div>

            {/* Totals Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>₹{lastCompletedSale.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Included GST (5%):</span>
                <span>₹{lastCompletedSale.taxAmount.toFixed(2)}</span>
              </div>
              {lastCompletedSale.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Discount:</span>
                  <span>-₹{lastCompletedSale.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {lastCompletedSale.roundOff !== 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Round Off:</span>
                  <span>₹{lastCompletedSale.roundOff.toFixed(2)}</span>
                </div>
              )}

              <div className="receipt-double-divider"></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800 }}>
                <span>GRAND TOTAL:</span>
                <span>₹{lastCompletedSale.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="receipt-divider"></div>

            {/* Payment Details */}
            <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {lastCompletedSale.payments.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Paid by [{p.method}]:</span>
                  <span>₹{p.amount.toFixed(2)}</span>
                </div>
              ))}
              {lastCompletedSale.payments.some(p => p.changeDue && p.changeDue > 0) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: '2px' }}>
                  <span>Change Returned:</span>
                  <span>₹{lastCompletedSale.payments[0].changeDue?.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="receipt-divider"></div>

            {/* Footer Notes */}
            <div style={{ textAlign: 'center', fontSize: '0.68rem', color: '#6b7280', marginTop: '10px' }}>
              <p>*** Fresh Fish Sold is Non-Returnable ***</p>
              <p>Thank you for shopping at Meanomeen!</p>
              <p>Order Online at www.meanomeen.com</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '12px',
          background: 'var(--bg-input)'
        }}>
          <button
            onClick={closeReceiptModal}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            New Sale [Esc]
          </button>

          <button
            onClick={handlePrint}
            style={{
              flex: 2,
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <PrinterIcon size={18} />
            <span>Print Thermal Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
