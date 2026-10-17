import React, { useState } from 'react';
import { ProductMaster } from './ProductMaster';
import { CompanyMaster } from './CompanyMaster';
import { BranchMaster } from './BranchMaster';

export const MastersHub: React.FC = () => {
  const [activeMasterTab, setActiveMasterTab] = useState<'PRODUCT' | 'BRANCH' | 'COMPANY'>('PRODUCT');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      height: '100%',
      overflowY: 'auto',
      paddingBottom: '20px'
    }}>
      {/* Top Masters Switcher Pill Bar */}
      <div className="glass-panel" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-card)',
        padding: '12px 18px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveMasterTab('PRODUCT')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${activeMasterTab === 'PRODUCT' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
              background: activeMasterTab === 'PRODUCT' ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-input)',
              color: activeMasterTab === 'PRODUCT' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🐟</span>
            <span>Product Master (Catch Catalog)</span>
          </button>

          <button
            onClick={() => setActiveMasterTab('BRANCH')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${activeMasterTab === 'BRANCH' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
              background: activeMasterTab === 'BRANCH' ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-input)',
              color: activeMasterTab === 'BRANCH' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🏪</span>
            <span>Branch / Store Master</span>
          </button>

          <button
            onClick={() => setActiveMasterTab('COMPANY')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${activeMasterTab === 'COMPANY' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
              background: activeMasterTab === 'COMPANY' ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-input)',
              color: activeMasterTab === 'COMPANY' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🏢</span>
            <span>Company Master (Parent Org)</span>
          </button>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Enterprise Multi-Entity Governance • Coimbatore Hub
        </div>
      </div>

      {/* Active Tab View */}
      {activeMasterTab === 'PRODUCT' && <ProductMaster />}
      {activeMasterTab === 'BRANCH' && <BranchMaster />}
      {activeMasterTab === 'COMPANY' && <CompanyMaster />}
    </div>
  );
};
