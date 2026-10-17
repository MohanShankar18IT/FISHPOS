import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { usePOS } from '../../context/POSContext';
import { FishImage } from '../common/FishImage';
import {
  XIcon,
  CheckCircleIcon,
  PlusIcon
} from '../common/Icons';

interface CustomerCutWeightModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddedToCart?: () => void;
}

interface CutOption {
  id: string;
  name: string;
  badge: string;
  lossPct: number;
  description: string;
  bestFor: string;
}

const CUT_OPTIONS: CutOption[] = [
  {
    id: 'Curry Cut (Head & Tail Included)',
    name: 'Curry Cut (With Head & Tail)',
    badge: 'Most Popular',
    lossPct: 15,
    description: 'Evenly sliced bone-in pieces including head & tail for flavorful broths',
    bestFor: 'Traditional Fish Curry, Meen Kulambu, Chettinad Gravy'
  },
  {
    id: 'Curry Cut (Head & Tail Excluded)',
    name: 'Curry Cut (No Head / Tail)',
    badge: 'Clean Cut',
    lossPct: 22,
    description: 'Center body chunky slices without head and tail',
    bestFor: 'Daily Fish Curry, Easy Kids Meal'
  },
  {
    id: 'Steaks / Slices',
    name: 'Steaks & Slices (Tawa Cut)',
    badge: 'Tawa Fry',
    lossPct: 18,
    description: 'Cross-section uniform round slices with bone, ideal for shallow frying',
    bestFor: 'Tawa Fry, Masala Pan Roast, Rava Fry'
  },
  {
    id: 'Whole Cleaned & Scaled',
    name: 'Whole Cleaned & Scaled',
    badge: 'Grill / Bake',
    lossPct: 12,
    description: 'Intact full fish, scales removed, gills & gut thoroughly cleansed',
    bestFor: 'Tandoori Fish, Banana Leaf Roast, Steaming, Charcoal Grill'
  },
  {
    id: 'Boneless Fillet',
    name: 'Boneless Fillets',
    badge: '100% Meat',
    lossPct: 40,
    description: 'De-boned pristine meat fillets with skin-on or skinless',
    bestFor: 'Fish Finger, Fish & Chips, Continental Bakes, Baby Food'
  },
  {
    id: 'Biryani Cut',
    name: 'Biryani Big Chunky Cut',
    badge: 'Dum Biryani',
    lossPct: 18,
    description: 'Thick succulent chunks that remain intact during dum cooking',
    bestFor: 'Seafood Dum Biryani, Fish Pulao'
  }
];

export const CustomerCutWeightModal: React.FC<CustomerCutWeightModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddedToCart
}) => {
  const { addCustomerCartItem } = usePOS();

  const [selectedWeight, setSelectedWeight] = useState<number>(0.5);
  const [customWeightInput, setCustomWeightInput] = useState<string>('0.500');
  const [selectedCut, setSelectedCut] = useState<CutOption>(CUT_OPTIONS[0]);
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [isAddedSuccess, setIsAddedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedWeight(0.5);
      setCustomWeightInput('0.500');
      setSelectedCut(CUT_OPTIONS[0]);
      setSpecialNotes('');
      setIsAddedSuccess(false);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const currentWeight = selectedWeight;
  const unitPrice = product.selling_price;
  const grossPrice = currentWeight * unitPrice;
  const netCleanedWeightKg = currentWeight * (1 - selectedCut.lossPct / 100);

  const handleWeightPreset = (weightKg: number) => {
    setSelectedWeight(weightKg);
    setCustomWeightInput(weightKg.toFixed(3));
  };

  const handleCustomWeightChange = (val: string) => {
    setCustomWeightInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setSelectedWeight(num);
    }
  };

  const handleAddToCart = () => {
    if (currentWeight <= 0) return;

    addCustomerCartItem(
      product,
      currentWeight,
      selectedCut.id,
      selectedCut.bestFor,
      specialNotes.trim() || undefined
    );

    setIsAddedSuccess(true);
    setTimeout(() => {
      setIsAddedSuccess(false);
      onClose();
      if (onAddedToCart) onAddedToCart();
    }, 450);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.82)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 250,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '680px',
        maxHeight: '92vh',
        overflowY: 'auto',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1.5px solid var(--accent-cyan)',
              flexShrink: 0
            }}>
              <FishImage
                src={product.image_url}
                alt={product.name}
                fallbackIconSize={28}
                borderRadius="var(--radius-md)"
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  {product.name}
                </h3>
                {product.local_name && (
                  <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                    {product.local_name}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Fresh Catch Rate: <strong className="mono-num" style={{ color: 'var(--accent-emerald)' }}>₹{product.selling_price.toFixed(2)} / KG</strong> • 100% Chemical-Free
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
              padding: '6px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <XIcon size={22} />
          </button>
        </div>

        {/* 1. Weight Selection */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              1. Select Catch Weight
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
              Gross Uncleaned Weight
            </span>
          </div>

          {/* Quick presets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {[
              { label: '250 g', kg: 0.25 },
              { label: '500 g', kg: 0.5 },
              { label: '750 g', kg: 0.75 },
              { label: '1.0 KG', kg: 1.0 },
              { label: '1.5 KG', kg: 1.5 },
            ].map(preset => {
              const isSelected = selectedWeight === preset.kg;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleWeightPreset(preset.kg)}
                  style={{
                    padding: '10px 6px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                    background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-input)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Custom weight slider / input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '10px',
            background: 'var(--bg-input)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Custom Weight (KG):</span>
            <input
              type="number"
              step="0.05"
              min="0.1"
              max="20"
              value={customWeightInput}
              onChange={(e) => handleCustomWeightChange(e.target.value)}
              style={{
                width: '100px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 800,
                padding: '4px 8px',
                fontFamily: 'var(--font-mono)'
              }}
            />
            <span className="mono-num" style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
              = {(currentWeight * 1000).toFixed(0)} Grams
            </span>
          </div>
        </div>

        {/* 2. Cutting & Cleaning Style */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              2. Choose Cutting & Cleaning Style
            </label>
            <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
              Cleaned & Scaled with RO Water
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {CUT_OPTIONS.map(opt => {
              const isSelected = selectedCut.id === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedCut(opt)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                    background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                      {opt.name}
                    </h4>
                    <span className={`badge ${isSelected ? 'badge-cyan' : 'badge-slate'}`} style={{ fontSize: '0.62rem' }}>
                      {opt.badge}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                    {opt.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.68rem' }}>
                    <span style={{ color: 'var(--accent-amber)' }}>
                      🍳 {opt.bestFor}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Weight Transparency Guide & Cooking Note */}
        <div style={{
          background: 'rgba(6, 182, 212, 0.05)',
          border: '1px dashed var(--accent-cyan)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Cleaned Weight Transparency
            </div>
            <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 700, marginTop: '2px' }}>
              Gross: <span className="mono-num">{currentWeight.toFixed(3)} KG</span> ➔ Net Cooking Weight: <span className="mono-num" style={{ color: 'var(--accent-emerald)' }}>~{netCleanedWeightKg.toFixed(3)} KG</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              ({selectedCut.lossPct}% gutting, gills & descaling loss excluded)
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Estimated Price</div>
            <div className="mono-num" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              ₹{grossPrice.toFixed(2)}
            </div>
          </div>
        </div>

        {/* 4. Special Instructions */}
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            Special Cleaning or Packaging Request (Optional):
          </label>
          <input
            type="text"
            placeholder="e.g., Pack head separately for soup, Make slices medium-thick..."
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              padding: '8px 12px',
              fontSize: '0.8rem'
            }}
          />
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            style={{
              padding: '10px 24px',
              borderRadius: 'var(--radius-md)',
              background: isAddedSuccess ? 'var(--accent-emerald)' : 'var(--primary)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-glow)',
              transition: 'all 0.2s'
            }}
          >
            {isAddedSuccess ? (
              <>
                <CheckCircleIcon size={18} />
                <span>Added to Fresh Cart!</span>
              </>
            ) : (
              <>
                <PlusIcon size={18} />
                <span>Add to Cart • ₹{grossPrice.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
