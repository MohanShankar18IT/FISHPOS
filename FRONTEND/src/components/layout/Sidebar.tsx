import React from 'react';
import { usePOS } from '../../context/POSContext';
import { FishIcon, ShoppingCartIcon, PackageIcon, BarChartIcon } from '../common/Icons';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, onlineOrders, hasPermission, currentUser } = usePOS();
  const pendingCount = onlineOrders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;

  const navItems = [
    { id: 'pos' as const, label: 'Counter POS', icon: FishIcon, badge: null, permKey: 'POS:CREATE_SALE' },
    { id: 'customer-store' as const, label: 'Customer Storefront', icon: ShoppingCartIcon, badge: 'LIVE', permKey: 'POS:CREATE_SALE' },
    { id: 'online-orders' as const, label: 'Online Orders Hub', icon: ShoppingCartIcon, badge: pendingCount > 0 ? pendingCount : null, permKey: 'ONLINE_ORDERS:VIEW_ORDERS' },
    { id: 'inventory' as const, label: 'Fresh Catch & Stock', icon: PackageIcon, badge: null, permKey: 'INVENTORY:VIEW_STOCK' },
    { id: 'reports' as const, label: 'Reports & Analytics', icon: BarChartIcon, badge: null, permKey: 'REPORTS:VIEW_DAILY_SALES' },
    { id: 'masters' as const, label: 'Product & Store Masters', icon: PackageIcon, badge: 'ADMIN', permKey: 'MASTERS:VIEW' },
  ];

  return (
    <aside style={{
      width: '240px',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px 12px',
      minHeight: 'calc(100vh - 64px)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ padding: '0 12px 10px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Role: <span style={{ color: 'var(--accent-cyan)' }}>{currentUser?.role.replace('_', ' ') || 'Guest'}</span>
        </div>
        {navItems.map(item => {
          const isPermitted = hasPermission(item.permKey);
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              disabled={!isPermitted}
              onClick={() => isPermitted && setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                color: isPermitted ? (isActive ? '#ffffff' : 'var(--text-secondary)') : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: isPermitted ? 'pointer' : 'not-allowed',
                opacity: isPermitted ? 1 : 0.45,
                transition: 'all 0.15s ease',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={19} className={isActive ? 'text-sky-400' : ''} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && isPermitted && (
                <span style={{
                  background: 'var(--accent-cyan)',
                  color: '#000000',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  padding: '2px 7px',
                  borderRadius: '9999px'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Weighing scale connection status */}
      <div style={{
        background: 'var(--bg-main)',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Weighing Scale</span>
          <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>CONNECTED</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
          Digital Scale: <span className="mono-num" style={{ color: 'var(--accent-emerald)' }}>PORT-RS232</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          Tare weight auto-zero active
        </div>
      </div>
    </aside>
  );
};
