import React from 'react';
import { usePOS } from '../../context/POSContext';
import { UserRole } from '../../types';

export const RoleSwitcherModal: React.FC = () => {
  const {
    isRoleSwitcherModalOpen,
    setIsRoleSwitcherModalOpen,
    currentUser,
    switchRoleDemo,
    logoutUser
  } = usePOS();

  if (!isRoleSwitcherModalOpen || !currentUser) return null;

  const roleConfigs = [
    {
      role: 'CASHIER' as UserRole,
      title: 'Cashier POS',
      desc: 'Billing, Weighing Scale & Cash Float (REG-01)',
      icon: '⚡',
      color: 'var(--accent-emerald)',
      bg: 'rgba(16, 185, 129, 0.15)'
    },
    {
      role: 'STORE_MANAGER' as UserRole,
      title: 'Store Manager',
      desc: 'Multi-Register Sales, Shifts & GSTR-1 Ledger',
      icon: '🏪',
      color: 'var(--accent-purple)',
      bg: 'rgba(168, 85, 247, 0.15)'
    },
    {
      role: 'INVENTORY_MANAGER' as UserRole,
      title: 'Inventory Chief',
      desc: 'Chiller Bays (-2°C to 2°C) & Fresh Catch Lots',
      icon: '📦',
      color: 'var(--accent-amber)',
      bg: 'rgba(245, 158, 11, 0.15)'
    },
    {
      role: 'ONLINE_ORDER_MANAGER' as UserRole,
      title: 'Online Dispatcher',
      desc: 'Omnichannel Orders Kanban & Cutting Slips',
      icon: '🛵',
      color: 'var(--accent-cyan)',
      bg: 'rgba(6, 182, 212, 0.15)'
    },
    {
      role: 'SUPER_ADMIN' as UserRole,
      title: 'Super Admin',
      desc: 'Company/Branch Masters, 24 DB Schemas & RBAC',
      icon: '👑',
      color: 'var(--accent-rose)',
      bg: 'rgba(244, 63, 94, 0.15)'
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '740px',
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        boxShadow: 'var(--shadow-xl)',
        animation: 'fadeIn 0.2s ease',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '18px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '12px'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
              🔒 Single Active Role Session Switcher
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
              Switch Operating User Role
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Current User: <strong style={{ color: '#ffffff' }}>{currentUser.fullName}</strong> (<span style={{ color: 'var(--accent-cyan)' }}>{currentUser.role.replace(/_/g, ' ')}</span>)
            </p>
          </div>

          <button
            onClick={() => setIsRoleSwitcherModalOpen(false)}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1rem'
            }}
          >
            ✕
          </button>
        </div>

        {/* Visual Grid of All 5 Staff Roles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginBottom: '18px' }}>
          {roleConfigs.map(r => {
            const isActive = currentUser.role === r.role;
            return (
              <div
                key={r.role}
                onClick={() => {
                  switchRoleDemo(r.role);
                  setIsRoleSwitcherModalOpen(false);
                }}
                style={{
                  background: isActive ? r.bg : 'var(--bg-input)',
                  border: `1.5px solid ${isActive ? r.color : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.5rem' }}>{r.icon}</span>
                  {isActive ? (
                    <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>
                      ACTIVE SESSION
                    </span>
                  ) : (
                    <span className="badge" style={{ fontSize: '0.62rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                      CLICK TO SWITCH
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: isActive ? '#ffffff' : 'var(--text-primary)' }}>
                  {r.title}
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', minHeight: '32px' }}>
                  {r.desc}
                </div>

                <button
                  type="button"
                  style={{
                    marginTop: '8px',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? r.color : 'var(--bg-card)',
                    color: isActive ? '#000000' : r.color,
                    border: `1px solid ${r.color}`,
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  {isActive ? '✓ Active Role' : '⚡ Switch Role'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
          <button
            onClick={() => {
              setIsRoleSwitcherModalOpen(false);
              logoutUser();
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid var(--accent-rose)',
              color: 'var(--accent-rose)',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🚪</span>
            <span>Sign Out Active Session</span>
          </button>

          <button
            onClick={() => setIsRoleSwitcherModalOpen(false)}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
