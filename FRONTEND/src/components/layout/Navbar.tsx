import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { UserRole } from '../../types';
import { ClockIcon, DollarIcon, ShoppingCartIcon } from '../common/Icons';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    currentShift,
    onlineOrders,
    setActiveTab,
    heldSales,
    setIsHeldModalOpen,
    currentUser,
    setIsRolePermissionsModalOpen,
    setIsRoleSwitcherModalOpen,
    customerCartItemCount,
    activeBranch,
    activeCompany
  } = usePOS();

  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const pendingOnlineCount = onlineOrders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;

  const roleColors: Record<UserRole, string> = {
    SUPER_ADMIN: 'badge-purple',
    STORE_MANAGER: 'badge-cyan',
    CASHIER: 'badge-emerald',
    INVENTORY_MANAGER: 'badge-amber',
    ONLINE_ORDER_MANAGER: 'badge-cyan'
  };

  const roleIcons: Record<UserRole, string> = {
    SUPER_ADMIN: '👑',
    STORE_MANAGER: '🏪',
    CASHIER: '🐟',
    INVENTORY_MANAGER: '📦',
    ONLINE_ORDER_MANAGER: '🛵'
  };

  return (
    <header className="glass-panel" style={{
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Outlet info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          overflow: 'hidden',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)',
          border: '2px solid var(--accent-cyan)',
          flexShrink: 0
        }}>
          <img src="/logo.jpg" alt="meanOmeen Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              {activeCompany ? activeCompany.trade_name : 'MEANOMEEN'} <span style={{ color: 'var(--accent-cyan)' }}>FISH POS</span>
            </h1>
            <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
              <span className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }}></span>
              LIVE POS
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Branch: <strong style={{ color: '#ffffff' }}>{activeBranch ? activeBranch.name : 'RS Puram Main Chiller Hub, Coimbatore'}</strong> • Reg: <strong style={{ color: 'var(--accent-cyan)' }}>{currentShift.registerNumber}</strong>
          </p>
        </div>
      </div>

      {/* Right User, Stats & Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Held Orders Quick Indicator */}
        {heldSales.length > 0 && (
          <button
            onClick={() => setIsHeldModalOpen(true)}
            className="badge badge-amber"
            style={{
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ⏸ <strong>{heldSales.length} Held Cart{heldSales.length > 1 ? 's' : ''}</strong>
          </button>
        )}

        {/* Customer Storefront Mode Switcher */}
        <button
          onClick={() => setActiveTab(activeTab === 'customer-store' || activeTab === 'customer-tracking' ? 'pos' : 'customer-store')}
          style={{
            background: activeTab === 'customer-store' || activeTab === 'customer-tracking'
              ? 'var(--primary)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
            border: `1px solid ${activeTab === 'customer-store' || activeTab === 'customer-tracking' ? 'var(--accent-cyan)' : 'var(--accent-emerald)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '6px 14px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.82rem',
            boxShadow: 'var(--shadow-glow)',
            transition: 'all 0.2s'
          }}
        >
          <span>{activeTab === 'customer-store' || activeTab === 'customer-tracking' ? '🏪 Staff POS Terminal' : '🛍️ Customer Online Store'}</span>
          {customerCartItemCount > 0 && !(activeTab === 'customer-store' || activeTab === 'customer-tracking') && (
            <span style={{
              background: 'var(--accent-emerald)',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.68rem',
              padding: '1px 6px',
              borderRadius: '9999px'
            }}>
              {customerCartItemCount}
            </span>
          )}
        </button>

        {/* Online Orders Live Pulse */}
        <button
          onClick={() => setActiveTab('online-orders')}
          style={{
            background: pendingOnlineCount > 0 ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-input)',
            border: `1px solid ${pendingOnlineCount > 0 ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '6px 12px',
            color: pendingOnlineCount > 0 ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.8rem',
            transition: 'all 0.2s'
          }}
        >
          <ShoppingCartIcon size={16} />
          <span>Staff Kanban</span>
          {pendingOnlineCount > 0 && (
            <span style={{
              background: 'var(--accent-cyan)',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.7rem',
              padding: '1px 6px',
              borderRadius: '9999px'
            }}>
              {pendingOnlineCount}
            </span>
          )}
        </button>

        {/* View Role Permissions Table Button */}
        <button
          onClick={() => setIsRolePermissionsModalOpen(true)}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 12px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          <span>🔐 RBAC Access Matrix</span>
        </button>

        {/* Shift Cash Display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-input)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <DollarIcon size={16} className="text-emerald-400" />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Shift Sales</div>
            <div className="mono-num" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
              ₹{currentShift.totalSalesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Clock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-secondary)',
          fontSize: '0.82rem',
          fontWeight: 600,
          background: 'var(--bg-input)',
          padding: '6px 10px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <ClockIcon size={15} />
          <span className="mono-num">{time}</span>
        </div>

        {/* User Role Badge & Direct Workspace Switcher Modal Trigger */}
        {currentUser && (
          <div>
            <button
              onClick={() => setIsRoleSwitcherModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1.5px solid var(--accent-cyan)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 14px',
                cursor: 'pointer',
                color: '#ffffff'
              }}
              title="Click to Switch Role Workspace"
            >
              <span style={{ fontSize: '1.1rem' }}>{roleIcons[currentUser.role]}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>{currentUser.fullName}</div>
                <span className={`badge ${roleColors[currentUser.role]}`} style={{ fontSize: '0.6rem', padding: '1px 6px' }}>
                  {currentUser.role.replace(/_/g, ' ')}
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', marginLeft: '4px', fontWeight: 800 }}>
                ⚡ Switch Login
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
