import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { FishImage } from '../common/FishImage';
import { PlusIcon, AlertTriangleIcon, TrashIcon } from '../common/Icons';

export const InventoryManager: React.FC = () => {
  const { products } = usePOS();
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);
  const [showWastageModal, setShowWastageModal] = useState<boolean>(false);

  // Batch modal state
  const [lotNumber, setLotNumber] = useState<string>(`LOT-${Date.now().toString().slice(-4)}`);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [supplierName, setSupplierName] = useState<string>('Cochin Harbor Deep Sea Guild');
  const [landingPort, setLandingPort] = useState<string>('Munambam Harbor, Kochi (Coimbatore Chilled Sourcing)');
  const [receivedWeight, setReceivedWeight] = useState<string>('25.000');
  const [costPerKg, setCostPerKg] = useState<string>('700.00');

  // Wastage modal state
  const [wastageProductId, setWastageProductId] = useState<string>(products[0]?.id || '');
  const [wastageWeight, setWastageWeight] = useState<string>('1.500');
  const [wastageReason, setWastageReason] = useState<string>('CUTTING_LOSS');
  const [wastageNotes, setWastageNotes] = useState<string>('Fish cleaning head & gill removal loss');

  const handleSaveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Fresh catch batch ${lotNumber} (${receivedWeight} kg) recorded to stock ledger!`);
    setShowBatchModal(false);
  };

  const handleSaveWastage = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Wastage of ${wastageWeight} kg (${wastageReason}) deducted from stock ledger!`);
    setShowWastageModal(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      flex: 1,
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
            Fresh Catch & Real-Time Stock Ledger
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Physical inventory, fresh catch lot intake, and cutting loss & spoilage tracking
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowWastageModal(true)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--accent-rose)',
              color: 'var(--accent-rose)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <TrashIcon size={16} />
            <span>Record Wastage / Cutting Loss</span>
          </button>

          <button
            onClick={() => setShowBatchModal(true)}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <PlusIcon size={16} />
            <span>Receive Fresh Catch Lot</span>
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="glass-panel" style={{
        flex: 1,
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <th style={{ padding: '14px 18px' }}>SKU & Barcode</th>
              <th style={{ padding: '14px 18px' }}>Fish Variety / Local Name</th>
              <th style={{ padding: '14px 18px' }}>Category</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Selling Rate</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Physical Stock</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Online Reserved</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Available Stock</th>
              <th style={{ padding: '14px 18px', textAlign: 'center' }}>Stock Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const reserved = product.category_id === 'cat-sea' ? 1.500 : 0.000;
              const available = Math.max(0, product.current_stock - reserved);
              const isLow = available <= product.min_stock_alert;

              return (
                <tr
                  key={product.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{product.sku}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{product.barcode || 'N/A'}</div>
                  </td>

                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                        <FishImage src={product.image_url} alt={product.name} fallbackIconSize={18} borderRadius="var(--radius-sm)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#ffffff' }}>{product.name}</div>
                        {product.local_name && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{product.local_name}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '14px 18px' }}>
                    <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                      {product.category_name}
                    </span>
                  </td>

                  <td className="mono-num" style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    ₹{product.selling_price.toFixed(2)} / {product.unit_type}
                  </td>

                  <td className="mono-num" style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 600, color: '#ffffff' }}>
                    {product.current_stock.toFixed(3)} {product.unit_type}
                  </td>

                  <td className="mono-num" style={{ padding: '14px 18px', textAlign: 'right', color: 'var(--accent-amber)', fontWeight: 600 }}>
                    {reserved.toFixed(3)} {product.unit_type}
                  </td>

                  <td className="mono-num" style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, fontSize: '0.95rem', color: isLow ? 'var(--accent-rose)' : 'var(--accent-cyan)' }}>
                    {available.toFixed(3)} {product.unit_type}
                  </td>

                  <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                    {isLow ? (
                      <span className="badge badge-rose" style={{ fontSize: '0.65rem' }}>
                        <AlertTriangleIcon size={12} /> Low Chiller Stock
                      </span>
                    ) : (
                      <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                        Adequate
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Fresh Catch Receiving Modal */}
      {showBatchModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 10, 20, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 260,
          padding: '20px'
        }}>
          <form onSubmit={handleSaveBatch} className="glass-panel" style={{
            width: '100%',
            maxWidth: '540px',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              Fresh Catch Lot Intake
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Batch / Lot Number
                </label>
                <input
                  type="text"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    color: '#ffffff'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Fish Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    color: '#ffffff'
                  }}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Supplier / Boat Association
              </label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Landing Port / Harbor Origin
              </label>
              <input
                type="text"
                value={landingPort}
                onChange={(e) => setLandingPort(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Received Net Weight (KG)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={receivedWeight}
                  onChange={(e) => setReceivedWeight(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Purchase Cost / KG (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={costPerKg}
                  onChange={(e) => setCostPerKg(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Credit Stock Ledger
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Wastage Logging Modal */}
      {showWastageModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 10, 20, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 260,
          padding: '20px'
        }}>
          <form onSubmit={handleSaveWastage} className="glass-panel" style={{
            width: '100%',
            maxWidth: '480px',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-rose)' }}>
              Record Stock Wastage / Loss
            </h3>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Fish Product
              </label>
              <select
                value={wastageProductId}
                onChange={(e) => setWastageProductId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff'
                }}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Wastage Weight (KG)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={wastageWeight}
                  onChange={(e) => setWastageWeight(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Loss Reason
                </label>
                <select
                  value={wastageReason}
                  onChange={(e) => setWastageReason(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    color: '#ffffff'
                  }}
                >
                  <option value="CUTTING_LOSS">Cutting / Gutting Loss</option>
                  <option value="SPOILAGE">Chiller Spoilage</option>
                  <option value="ICE_MELT">Ice Melt Drainage</option>
                  <option value="EXPIRED">Expiry Exceeded</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Audit Notes & Manager Remarks
              </label>
              <textarea
                value={wastageNotes}
                onChange={(e) => setWastageNotes(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => setShowWastageModal(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-rose)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Deduct Wastage
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
