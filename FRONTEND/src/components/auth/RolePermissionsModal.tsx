import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { UserRole } from '../../types';
import { XIcon } from '../common/Icons';

export const RolePermissionsModal: React.FC = () => {
  const { isRolePermissionsModalOpen, setIsRolePermissionsModalOpen, rolePermissionsMatrix } = usePOS();
  const [activeTab, setActiveTab] = useState<'tables' | 'rbac'>('rbac');

  if (!isRolePermissionsModalOpen || !rolePermissionsMatrix) return null;

  const rolesList: { role: UserRole; label: string; badgeClass: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', badgeClass: 'badge-purple' },
    { role: 'STORE_MANAGER', label: 'Store Manager', badgeClass: 'badge-cyan' },
    { role: 'CASHIER', label: 'Cashier', badgeClass: 'badge-emerald' },
    { role: 'INVENTORY_MANAGER', label: 'Inventory Chief', badgeClass: 'badge-amber' },
    { role: 'ONLINE_ORDER_MANAGER', label: 'Online Dispatcher', badgeClass: 'badge-cyan' },
  ];

  const dbTablesList = [
    { name: 'users', category: 'Auth & Staff', pkey: 'id (UUID)', desc: 'Store cashiers, managers, admins with bcrypt credentials and roles' },
    { name: 'stores', category: 'Store Masters', pkey: 'id (UUID)', desc: 'Store outlet branches, address, GSTIN, and active flags' },
    { name: 'shifts', category: 'Register & Float', pkey: 'id (UUID)', desc: 'Register cash drawer shifts, opening float, running collections, and close counts' },
    { name: 'categories', category: 'Product Catalog', pkey: 'id (UUID)', desc: 'Seafood category hierarchy (Sea fish, Freshwater, Prawns, Crab, Dried)' },
    { name: 'products', category: 'Product Catalog', pkey: 'id (UUID)', desc: 'Fish catalog with SKU, barcode, Tamil name, rate/kg, tax rate, and cut options' },
    { name: 'product_price_history', category: 'Product Catalog', pkey: 'id (UUID)', desc: 'Immutable audit log of historical selling price adjustments' },
    { name: 'suppliers', category: 'Purchasing', pkey: 'id (UUID)', desc: 'Boat harbor suppliers, landing masters, GST, and payment terms' },
    { name: 'purchases', category: 'Purchasing', pkey: 'id (UUID)', desc: 'Purchase orders and goods receipt totals from harbor lots' },
    { name: 'purchase_items', category: 'Purchasing', pkey: 'id (UUID)', desc: 'Itemized received fish lots with weight in KG and cost/kg' },
    { name: 'batch_lots', category: 'Inventory & Catch', pkey: 'id (UUID)', desc: 'Fresh catch lots with landing port origin, arrival weight, and expiry' },
    { name: 'inventory', category: 'Inventory & Catch', pkey: 'id (UUID)', desc: 'Real-time physical, reserved, and available chiller stock per store' },
    { name: 'inventory_movements', category: 'Inventory & Catch', pkey: 'id (UUID)', desc: 'Immutable stock ledger for purchases, sales, wastage, and reservations' },
    { name: 'customers', category: 'Sales & CRM', pkey: 'id (UUID)', desc: 'Customer phone directory, address, lifetime spend, and loyalty points' },
    { name: 'sales', category: 'Sales & POS', pkey: 'id (UUID)', desc: 'Retail counter POS bills, cashier, shift, customer, and grand total' },
    { name: 'sale_items', category: 'Sales & POS', pkey: 'id (UUID)', desc: 'Itemized fish sale lines with cut style, net weight (KG), and line total' },
    { name: 'payments', category: 'Sales & POS', pkey: 'id (UUID)', desc: 'Settlement transactions: Cash, UPI, Card, Split with change calculation' },
    { name: 'sales_returns', category: 'Returns', pkey: 'id (UUID)', desc: 'Sales return vouchers with supervisor approval and refund amounts' },
    { name: 'sales_return_items', category: 'Returns', pkey: 'id (UUID)', desc: 'Returned fish lines and restock vs write-off decisions' },
    { name: 'online_orders', category: 'Online Commerce', pkey: 'id (UUID)', desc: 'Omnichannel orders with delivery type, slot, address, and status lifecycle' },
    { name: 'online_order_items', category: 'Online Commerce', pkey: 'id (UUID)', desc: 'Online order lines with custom fish cutting instructions' },
    { name: 'stock_reservations', category: 'Online Commerce', pkey: 'id (UUID)', desc: 'Reserved stock allocations for active online orders to prevent overselling' },
    { name: 'permissions', category: 'RBAC Security', pkey: 'id (UUID)', desc: 'Granular system module action definitions' },
    { name: 'role_permissions', category: 'RBAC Security', pkey: 'id (UUID)', desc: 'Role-to-permission mapping table controlling access privileges' },
    { name: 'system_settings', category: 'Configuration', pkey: 'id (UUID)', desc: 'Store hardware COM ports, GST rates, and system settings' },
    { name: 'audit_logs', category: 'Security & Audit', pkey: 'id (UUID)', desc: 'Immutable security audit logs for price updates, overrides, and voided sales' }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 10, 20, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 350,
      padding: '24px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '1120px',
        maxHeight: '92vh',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        background: 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(2, 132, 199, 0.08)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                Fish POS Database Schema & Role Access Matrix
              </h2>
              <span className="badge badge-emerald">PostgreSQL 15+ Compatible</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              PostgreSQL URI: <span className="mono-num" style={{ color: 'var(--accent-cyan)' }}>postgresql+psycopg2://postgres:***@localhost:5432/fish_pos_db</span>
            </p>
          </div>

          <button
            onClick={() => setIsRolePermissionsModalOpen(false)}
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

        {/* View Switcher Tabs */}
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-input)'
        }}>
          <button
            onClick={() => setActiveTab('rbac')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              background: activeTab === 'rbac' ? 'var(--primary)' : 'transparent',
              border: `1px solid ${activeTab === 'rbac' ? 'var(--primary)' : 'var(--border-subtle)'}`,
              color: activeTab === 'rbac' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            🔐 Role Permissions Matrix (5 User Roles)
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              background: activeTab === 'tables' ? 'var(--primary)' : 'transparent',
              border: `1px solid ${activeTab === 'tables' ? 'var(--primary)' : 'var(--border-subtle)'}`,
              color: activeTab === 'tables' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            🗄 All 24 Required Database Tables
          </button>
        </div>

        {/* Tab 1: RBAC Matrix */}
        {activeTab === 'rbac' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <th style={{ padding: '12px 14px', width: '130px' }}>Module</th>
                  <th style={{ padding: '12px 14px' }}>Permission & Privilege</th>
                  {rolesList.map(r => (
                    <th key={r.role} style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <span className={`badge ${r.badgeClass}`} style={{ fontSize: '0.62rem' }}>
                        {r.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rolePermissionsMatrix.permissions.map(perm => (
                  <tr
                    key={perm.key}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {perm.module}
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>{perm.name}</div>
                      {perm.description && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {perm.description}
                        </div>
                      )}
                    </td>

                    {rolesList.map(r => {
                      const isGranted = rolePermissionsMatrix.matrix[r.role]?.[perm.key] ?? false;
                      return (
                        <td key={r.role} style={{ padding: '12px 10px', textAlign: 'center' }}>
                          {isGranted ? (
                            <span style={{
                              color: 'var(--accent-emerald)',
                              fontSize: '1rem',
                              fontWeight: 800,
                              background: 'var(--accent-emerald-light)',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              ✓
                            </span>
                          ) : (
                            <span style={{
                              color: 'var(--text-muted)',
                              fontSize: '0.9rem',
                              opacity: 0.4
                            }}>
                              —
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: 24 Database Tables List */}
        {activeTab === 'tables' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <th style={{ padding: '12px 14px', width: '220px' }}>Table Name</th>
                  <th style={{ padding: '12px 14px', width: '160px' }}>Category</th>
                  <th style={{ padding: '12px 14px', width: '120px' }}>Primary Key</th>
                  <th style={{ padding: '12px 14px' }}>Description & Scope</th>
                </tr>
              </thead>
              <tbody>
                {dbTablesList.map((t, idx) => (
                  <tr
                    key={t.name}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div className="mono-num" style={{ fontWeight: 800, color: '#ffffff' }}>
                        {idx + 1}. {t.name}
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                        {t.category}
                      </span>
                    </td>

                    <td className="mono-num" style={{ padding: '12px 14px', color: 'var(--accent-amber)', fontSize: '0.78rem' }}>
                      {t.pkey}
                    </td>

                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      {t.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-input)'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            All 24 tables mapped to SQLAlchemy ORM models with Alembic migrations
          </span>

          <button
            onClick={() => setIsRolePermissionsModalOpen(false)}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Close Schema & Access Table
          </button>
        </div>
      </div>
    </div>
  );
};
