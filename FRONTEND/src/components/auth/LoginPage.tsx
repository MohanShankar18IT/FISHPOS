import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { UserRole } from '../../types';
import {
  FishIcon,
  ArrowRightIcon
} from '../common/Icons';

interface RoleConfig {
  role: UserRole | 'CUSTOMER';
  label: string;
  badge: string;
  badgeClass: string;
  defaultUser: string;
  defaultPass: string;
  terminalLabel: string;
  defaultTerminal: string;
  landingTab: string;
  desc: string;
  icon: string;
  permissions: string[];
}

const ROLE_CONFIGS: RoleConfig[] = [
  {
    role: 'CASHIER',
    label: 'Cashier POS Terminal',
    badge: 'Retail Counter',
    badgeClass: 'badge-cyan',
    defaultUser: 'cashier1',
    defaultPass: 'cashier123',
    terminalLabel: 'Counter Register',
    defaultTerminal: 'REG-01 (Main POS Counter)',
    landingTab: 'Counter POS & Weighing Scale',
    desc: 'Rapid counter sales, digital scale tare/reading, cash drawer float & thermal billing',
    icon: '🐟',
    permissions: ['POS:CREATE_SALE', 'POS:APPLY_DISCOUNT', 'POS:HOLD_SALE', 'POS:PRINT_RECEIPT']
  },
  {
    role: 'STORE_MANAGER',
    label: 'Store Manager',
    badge: 'Store Operations',
    badgeClass: 'badge-purple',
    defaultUser: 'manager1',
    defaultPass: 'manager123',
    terminalLabel: 'Management Station',
    defaultTerminal: 'MGR-DESK-01 (RS Puram Main Outlet, Coimbatore)',
    landingTab: 'Reports & Analytics Dashboard',
    desc: 'Shift cash reconciliation, manager price overrides, sales register & GSTR-1 audits',
    icon: '🏪',
    permissions: ['REPORTS:VIEW_DAILY_SALES', 'POS:PRICE_OVERRIDE', 'POS:VOID_SALE', 'SHIFTS:CLOSE_REGISTER']
  },
  {
    role: 'INVENTORY_MANAGER',
    label: 'Inventory Chief',
    badge: 'Cold Storage & Intake',
    badgeClass: 'badge-amber',
    defaultUser: 'inventory1',
    defaultPass: 'inventory123',
    terminalLabel: 'Cold Room Terminal',
    defaultTerminal: 'CHILLER-BAY-01 (Harbor Receiving)',
    landingTab: 'Fresh Catch & Stock Management',
    desc: 'Harbor catch batch lot intake, cutting loss logging, ice melt shrinkage & stock ledger',
    icon: '📦',
    permissions: ['INVENTORY:VIEW_STOCK', 'INVENTORY:RECEIVE_BATCH', 'INVENTORY:LOG_WASTAGE']
  },
  {
    role: 'ONLINE_ORDER_MANAGER',
    label: 'Online Order Dispatcher',
    badge: 'Omnichannel Hub',
    badgeClass: 'badge-cyan',
    defaultUser: 'online1',
    defaultPass: 'online123',
    terminalLabel: 'Fulfillment Station',
    defaultTerminal: 'DISPATCH-HUB-01 (Express Packing Bay)',
    landingTab: 'Online Orders Fulfillment Kanban',
    desc: 'Incoming omnichannel order acceptance, cutting bay dispatch, flake ice packing & rider handover',
    icon: '🛵',
    permissions: ['ONLINE_ORDERS:VIEW_ORDERS', 'ONLINE_ORDERS:PROCESS_ORDER', 'ONLINE_ORDERS:DISPATCH_ORDER']
  },
  {
    role: 'SUPER_ADMIN',
    label: 'Super Admin',
    badge: 'Master Control',
    badgeClass: 'badge-purple',
    defaultUser: 'admin',
    defaultPass: 'admin123',
    terminalLabel: 'Admin Console',
    defaultTerminal: 'CENTRAL-HQ-01',
    landingTab: 'Full Platform Access (All Modules)',
    desc: 'Unrestricted system governance, 24 database schemas, RBAC matrix, product master & multi-store setup',
    icon: '👑',
    permissions: ['Full Access to all 24 DB Models & Modules']
  },
  {
    role: 'CUSTOMER',
    label: 'Customer / Online Shopper',
    badge: 'Public Storefront',
    badgeClass: 'badge-emerald',
    defaultUser: 'guest_customer',
    defaultPass: 'guest',
    terminalLabel: 'Shopping Device',
    defaultTerminal: 'Customer Web / Mobile Browser',
    landingTab: 'Customer Online Storefront',
    desc: 'Browse fresh boat landings, customize seafood cuts, choose delivery slot & track live orders',
    icon: '🛍️',
    permissions: ['Browse Fresh Catch', 'Custom Cuts & Weight', 'Home Delivery & Pickup', 'Live Order Tracking']
  }
];

export const LoginPage: React.FC = () => {
  const {
    loginUser,
    loginAsCustomer,
    registerCustomerAccount,
    loginCustomerAccountWithPhone,
    setIsRolePermissionsModalOpen,
    companies,
    branches,
    activeCompany,
    activeBranch,
    setActiveCompany,
    setActiveBranch
  } = usePOS();

  const [selectedRoleConfig, setSelectedRoleConfig] = useState<RoleConfig>(ROLE_CONFIGS[0]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(activeBranch?.id || 'store-01');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(activeCompany?.id || 'comp-001');

  const [username, setUsername] = useState<string>(ROLE_CONFIGS[0].defaultUser);
  const [password, setPassword] = useState<string>(ROLE_CONFIGS[0].defaultPass);
  const [terminal, setTerminal] = useState<string>(ROLE_CONFIGS[0].defaultTerminal);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [time, setTime] = useState<string>('');

  // Customer Mobile Registration & Login States
  const [customerAuthMode, setCustomerAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [custLoginPhone, setCustLoginPhone] = useState<string>('9840123456');
  const [custRegName, setCustRegName] = useState<string>('Priya Sundaram');
  const [custRegPhone, setCustRegPhone] = useState<string>('9840123456');
  const [custRegAddress, setCustRegAddress] = useState<string>('Flat 4B, Greenview Enclave, DB Road, RS Puram, Coimbatore - 641002');
  const [custRegEmail, setCustRegEmail] = useState<string>('priya.sundaram@gmail.com');
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectRole = (config: RoleConfig) => {
    setSelectedRoleConfig(config);
    setUsername(config.defaultUser);
    setPassword(config.defaultPass);
    setTerminal(config.defaultTerminal);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (selectedRoleConfig.role === 'CUSTOMER') {
      setIsLoading(true);
      try {
        if (customerAuthMode === 'LOGIN') {
          if (!custLoginPhone.trim()) throw new Error('Please enter your 10-digit registered mobile number');
          await loginCustomerAccountWithPhone(custLoginPhone);
        } else {
          if (!custRegName.trim() || !custRegPhone.trim()) throw new Error('Please enter name and mobile number');
          await registerCustomerAccount({
            name: custRegName.trim(),
            phone: custRegPhone.trim(),
            address: custRegAddress.trim() || undefined,
            email: custRegEmail.trim() || undefined
          });
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Customer authentication failed');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    try {
      await loginUser(username, password, terminal.split(' ')[0], selectedBranchId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid login credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantSignIn = async (config: RoleConfig) => {
    setErrorMsg('');
    setSuccessMsg('');
    if (config.role === 'CUSTOMER') {
      try {
        await loginCustomerAccountWithPhone('9840123456');
      } catch {
        loginAsCustomer();
      }
      return;
    }

    setIsLoading(true);
    try {
      await loginUser(config.defaultUser, config.defaultPass, config.defaultTerminal.split(' ')[0], selectedBranchId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0f2744 0%, #08101e 50%, #030712 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      {/* Background Ambience Dots */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'rgba(2, 132, 199, 0.08)',
        borderRadius: '50%',
        filter: 'blur(90px)',
        top: '10%',
        left: '15%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'rgba(6, 182, 212, 0.06)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        bottom: '10%',
        right: '15%',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '1060px',
        display: 'grid',
        gridTemplateColumns: '1.15fr 1fr',
        gap: '24px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Left Side: Brand Identity, Role Selection & Permissions Info */}
        <div className="glass-panel" style={{
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: '1px solid var(--border-subtle)'
        }}>
          <div>
            {/* Header Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
                border: '2px solid var(--accent-cyan)',
                flexShrink: 0
              }}>
                <img src="/logo.jpg" alt="meanOmeen Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  MEANOMEEN <span style={{ color: 'var(--accent-cyan)' }}>FISH POS</span>
                </h1>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Role-Based Retail, Inventory & Omnichannel Platform
                </p>
              </div>
            </div>

            {/* Company & Branch Master Selection + Single Role Session Banner */}
            <div style={{
              background: 'rgba(6, 182, 212, 0.06)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              marginBottom: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                    🏢 Company Master
                  </label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => {
                      setSelectedCompanyId(e.target.value);
                      const comp = companies.find(c => c.id === e.target.value);
                      if (comp) setActiveCompany(comp);
                    }}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ffffff',
                      padding: '6px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.trade_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                    🏪 Operating Branch
                  </label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => {
                      setSelectedBranchId(e.target.value);
                      const br = branches.find(b => b.id === e.target.value);
                      if (br) setActiveBranch(br);
                    }}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ffffff',
                      padding: '6px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '6px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>🔒</span> Single Active Role Session Mode
                </div>
                <div className="mono-num" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {time}
                </div>
              </div>
            </div>

            {/* Role Persona Cards */}
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                Select Role to Experience Tailored Workflows:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ROLE_CONFIGS.map((config) => {
                  const isSelected = selectedRoleConfig.role === config.role;
                  return (
                    <div
                      key={config.role}
                      onClick={() => handleSelectRole(config)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-input)',
                        border: `1.5px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.25rem' }}>{config.icon}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                              {config.label}
                            </span>
                            <span className={`badge ${config.badgeClass}`} style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                              {config.badge}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {config.desc}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInstantSignIn(config);
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: isSelected ? 'var(--accent-cyan)' : 'var(--bg-card)',
                            color: isSelected ? '#000000' : 'var(--accent-cyan)',
                            border: '1px solid var(--accent-cyan)',
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          ⚡ Sign In
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Database Schema & RBAC Table Modal Trigger */}
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setIsRolePermissionsModalOpen(true)}
              style={{
                width: '100%',
                padding: '9px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--accent-cyan)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>🔐 View RBAC Matrix & 24 PostgreSQL Tables</span>
            </button>
          </div>
        </div>

        {/* Right Side: Role-Specific Sign-In Card */}
        <div className="glass-panel" style={{
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)'
        }}>
          {/* Dynamic Role Header */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.4rem' }}>{selectedRoleConfig.icon}</span>
              <span className={`badge ${selectedRoleConfig.badgeClass}`} style={{ fontSize: '0.72rem' }}>
                {selectedRoleConfig.badge}
              </span>
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
              {selectedRoleConfig.label}
            </h2>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Default Landing View: <strong style={{ color: 'var(--accent-cyan)' }}>{selectedRoleConfig.landingTab}</strong>
            </p>
          </div>

          {errorMsg && (
            <div style={{
              background: 'var(--accent-rose-light)',
              border: '1px solid var(--accent-rose)',
              color: 'var(--accent-rose)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              marginBottom: '16px',
              fontWeight: 600
            }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid var(--accent-emerald)',
              color: 'var(--accent-emerald)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              marginBottom: '16px',
              fontWeight: 600
            }}>
              {successMsg}
            </div>
          )}

          {selectedRoleConfig.role === 'CUSTOMER' ? (
            /* Customer Mobile Auth (Login & Register) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Customer Auth Mode Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: 'var(--bg-input)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerAuthMode('LOGIN');
                    setErrorMsg('');
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: customerAuthMode === 'LOGIN' ? 'var(--accent-emerald)' : 'transparent',
                    color: customerAuthMode === 'LOGIN' ? '#000000' : 'var(--text-secondary)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  📱 Mobile Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomerAuthMode('REGISTER');
                    setErrorMsg('');
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: customerAuthMode === 'REGISTER' ? 'var(--accent-emerald)' : 'transparent',
                    color: customerAuthMode === 'REGISTER' ? '#000000' : 'var(--text-secondary)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  ✨ Register Account
                </button>
              </div>

              {customerAuthMode === 'LOGIN' ? (
                /* Customer Login via Registered Mobile No */
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '4px' }}>
                      Registered Mobile Number (10 Digits) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9840123456"
                      value={custLoginPhone}
                      onChange={(e) => setCustLoginPhone(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 14px',
                        color: '#ffffff',
                        fontSize: '1rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)'
                      }}
                    />
                  </div>

                  {/* Quick Select Demo Registered Customers */}
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Or select sample registered profile:
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {[
                        { name: 'Priya Sundaram', phone: '9840123456', pts: '120 Pts' },
                        { name: 'Anand Krishnan', phone: '9840987654', pts: '240 Pts' },
                        { name: 'Meenakshi Raman', phone: '9841122334', pts: '75 Pts' }
                      ].map(sample => (
                        <div
                          key={sample.phone}
                          onClick={() => setCustLoginPhone(sample.phone)}
                          style={{
                            padding: '6px 10px',
                            background: custLoginPhone === sample.phone ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-input)',
                            border: `1px solid ${custLoginPhone === sample.phone ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          <span style={{ fontWeight: 700, color: '#ffffff' }}>👤 {sample.name}</span>
                          <span className="mono-num" style={{ color: 'var(--accent-emerald)' }}>{sample.phone} ({sample.pts})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      marginTop: '6px',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-emerald)',
                      border: 'none',
                      color: '#000000',
                      fontWeight: 900,
                      fontSize: '0.95rem',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 0 15px rgba(16, 185, 129, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>{isLoading ? 'Verifying Mobile...' : 'Login with Mobile Number'}</span>
                    <ArrowRightIcon size={16} />
                  </button>
                </form>
              ) : (
                /* Register New Customer */
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Suresh Kumar"
                        value={custRegName}
                        onChange={(e) => setCustRegName(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 10px',
                          color: '#ffffff',
                          fontSize: '0.82rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9841234567"
                        value={custRegPhone}
                        onChange={(e) => setCustRegPhone(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 10px',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                          fontFamily: 'var(--font-mono)'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                      Delivery Address & Landmark
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Flat 3A, Mayflower Riverdale, Ramanathapuram, Coimbatore"
                      value={custRegAddress}
                      onChange={(e) => setCustRegAddress(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 10px',
                        color: '#ffffff',
                        fontSize: '0.82rem',
                        resize: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. suresh@gmail.com"
                      value={custRegEmail}
                      onChange={(e) => setCustRegEmail(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 10px',
                        color: '#ffffff',
                        fontSize: '0.82rem'
                      }}
                    />
                  </div>

                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    fontSize: '0.7rem',
                    color: 'var(--accent-emerald)'
                  }}>
                    🎁 <strong>New Member Benefit:</strong> Get 50 Welcome Loyalty Points on registration!
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      marginTop: '4px',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-emerald)',
                      border: 'none',
                      color: '#000000',
                      fontWeight: 900,
                      fontSize: '0.95rem',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 0 15px rgba(16, 185, 129, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>{isLoading ? 'Creating Profile...' : 'Register Customer & Enter Store'}</span>
                    <ArrowRightIcon size={16} />
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Staff Role Form */
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Terminal / Station Assignment */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {selectedRoleConfig.terminalLabel}
                </label>
                <input
                  type="text"
                  value={terminal}
                  onChange={(e) => setTerminal(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '9px 12px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                />
              </div>

              {/* Username */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Username / ID
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Password / Security PIN
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              {/* Authorized Features preview */}
              <div style={{
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Role Authorized Modules:
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {selectedRoleConfig.permissions.map((p, idx) => (
                    <span key={idx} className="badge badge-cyan" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  marginTop: '6px',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--shadow-glow)',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <FishIcon size={18} />
                <span>{isLoading ? 'Authenticating...' : `Sign In as ${selectedRoleConfig.label}`}</span>
              </button>
            </form>
          )}

          {/* Quick Info */}
          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Ocean Harbor Fish POS Platform • Shift float & catch weight authoritative backend
          </div>
        </div>
      </div>
    </div>
  );
};
