import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { ScaleIcon, KnifeIcon, XIcon } from '../common/Icons';
import { FishImage } from '../common/FishImage';

export const WeightModal: React.FC = () => {
  const { activeProductForWeight, closeWeightModal, addToCart } = usePOS();
  const [weight, setWeight] = useState<string>('1.000');
  const [selectedCut, setSelectedCut] = useState<string>('Whole');
  const [discount, setDiscount] = useState<string>('0');
  const [isTareActive, setIsTareActive] = useState<boolean>(false);

  useEffect(() => {
    if (activeProductForWeight) {
      setWeight('1.000');
      setSelectedCut(activeProductForWeight.cut_options[0] || 'Whole');
      setDiscount('0');
      setIsTareActive(false);
    }
  }, [activeProductForWeight]);

  if (!activeProductForWeight) return null;

  const numWeight = parseFloat(weight) || 0;
  const numDiscount = parseFloat(discount) || 0;

  // Calculate live preview
  const baseAmount = numWeight * activeProductForWeight.selling_price;
  const taxable = Math.max(0, baseAmount - numDiscount);
  const tax = (taxable * activeProductForWeight.tax_rate) / 100;
  const subtotal = taxable + tax;

  const quickWeights = [0.250, 0.500, 0.750, 1.000, 1.250, 1.500, 2.000, 2.500];

  const handleConfirm = () => {
    if (numWeight <= 0) return;
    addToCart(activeProductForWeight, numWeight, selectedCut, numDiscount);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 10, 20, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '560px',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        background: 'var(--bg-card)'
      }}>
        {/* Modal Header with Fish Photo */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(2, 132, 199, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1.5px solid var(--accent-cyan)',
              flexShrink: 0
            }}>
              <FishImage
                src={activeProductForWeight.image_url}
                alt={activeProductForWeight.name}
                fallbackIconSize={24}
                borderRadius="var(--radius-md)"
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ScaleIcon size={18} className="text-sky-400" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  {activeProductForWeight.name}
                </h2>
              </div>
              {activeProductForWeight.local_name && (
                <p style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', marginTop: '2px', fontWeight: 600 }}>
                  {activeProductForWeight.local_name}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={closeWeightModal}
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
          {/* Rate & Digital Weight Input */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{
              background: 'var(--bg-input)',
              padding: '14px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Unit Selling Rate
              </span>
              <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
                ₹{activeProductForWeight.selling_price.toFixed(2)} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {activeProductForWeight.unit_type}</span>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-input)',
              padding: '14px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--primary)',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Weight ({activeProductForWeight.unit_type})
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: isTareActive ? 'var(--accent-cyan)' : 'var(--text-muted)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isTareActive}
                    onChange={(e) => setIsTareActive(e.target.checked)}
                  />
                  Tare Tray (-150g)
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                <input
                  type="number"
                  step="0.001"
                  min="0.01"
                  autoFocus
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
                <span className="mono-num" style={{ fontSize: '1rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  {activeProductForWeight.unit_type}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Weight Presets */}
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Quick Catch Weight Presets (KG)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {quickWeights.map(qw => (
                <button
                  key={qw}
                  onClick={() => setWeight(qw.toFixed(3))}
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    background: numWeight === qw ? 'var(--primary)' : 'var(--bg-input)',
                    border: `1px solid ${numWeight === qw ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    color: numWeight === qw ? '#ffffff' : 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {qw.toFixed(3)} kg
                </button>
              ))}
            </div>
          </div>

          {/* Cutting & Cleaning Style Selector */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <KnifeIcon size={16} className="text-sky-400" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Cutting & Preparation Style
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {activeProductForWeight.cut_options.map(cut => {
                const isSelected = selectedCut === cut;
                return (
                  <button
                    key={cut}
                    onClick={() => setSelectedCut(cut)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-input)',
                      border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {cut}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subtotal Calculation Box */}
          <div style={{
            background: 'var(--bg-main)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Calculation: {numWeight.toFixed(3)} {activeProductForWeight.unit_type} × ₹{activeProductForWeight.selling_price.toFixed(2)} + GST ({activeProductForWeight.tax_rate}%)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Cut Style: <strong style={{ color: '#ffffff' }}>{selectedCut}</strong>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Line Total</span>
              <div className="mono-num" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                ₹{subtotal.toFixed(2)}
              </div>
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
            onClick={closeWeightModal}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel [Esc]
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '10px 28px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            Add to Bill [Enter]
          </button>
        </div>
      </div>
    </div>
  );
};
