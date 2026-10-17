import React from 'react';
import { usePOS } from '../../context/POSContext';
import { XIcon, ShoppingCartIcon } from '../common/Icons';

export const HoldOrdersModal: React.FC = () => {
  const { heldSales, recallHeldSale, isHeldModalOpen, setIsHeldModalOpen } = usePOS();

  if (!isHeldModalOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 10, 20, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 280,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '540px',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        background: 'var(--bg-card)'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(245, 158, 11, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>⏸</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
              Held Customer Carts ({heldSales.length})
            </h3>
          </div>
          <button
            onClick={() => setIsHeldModalOpen(false)}
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

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
          {heldSales.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
              No held sales currently in queue.
            </p>
          ) : (
            heldSales.map(held => (
              <div
                key={held.id}
                style={{
                  background: 'var(--bg-input)',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                    {held.customerName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Held at: {held.timestamp} • {held.items.length} items ({held.items.map(i => `${i.weightKg}kg ${i.name}`).join(', ')})
                  </div>
                  <div className="mono-num" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
                    ₹{held.grandTotal.toFixed(2)}
                  </div>
                </div>

                <button
                  onClick={() => recallHeldSale(held.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ShoppingCartIcon size={14} />
                  <span>Recall Cart</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
