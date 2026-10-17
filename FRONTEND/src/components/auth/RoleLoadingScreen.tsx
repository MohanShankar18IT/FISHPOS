import React, { useEffect, useState } from 'react';
import { UserRole } from '../../types';

interface RoleLoadingScreenProps {
  role: UserRole | 'CUSTOMER';
  fullName?: string;
  terminal?: string;
  onComplete?: () => void;
}

interface RoleConfigMeta {
  title: string;
  subtitle: string;
  icon: string;
  themeColor: string;
  bgGlow: string;
  workspaceName: string;
  steps: string[];
}

const ROLE_LOADING_DATA: Record<UserRole | 'CUSTOMER', RoleConfigMeta> = {
  CASHIER: {
    title: 'POS Billing Terminal',
    subtitle: 'Initializing Retail Counter & Catch Weight Hardware',
    icon: '⚡',
    themeColor: '#10b981',
    bgGlow: 'rgba(16, 185, 129, 0.25)',
    workspaceName: 'Counter POS & Weighing Scale Workspace',
    steps: [
      'Calibrating USB/Bluetooth Weighing Scale (Precision: 0.001 KG)...',
      'Connecting to Local Thermal Printer (58mm / 80mm ESC/POS)...',
      'Loading Active Shift Cash Drawer & Starting Float (REG-01)...',
      'Synchronizing Today’s Cochin & Bhavanisagar Retail Pricing...',
      'Opening High-Speed Touch & Barcode Scanner Grid...'
    ]
  },
  STORE_MANAGER: {
    title: 'Store Operations & Audit Suite',
    subtitle: 'Aggregating Multi-Register Sales, Shifts & Tax Ledger',
    icon: '🏪',
    themeColor: '#a855f7',
    bgGlow: 'rgba(168, 85, 247, 0.25)',
    workspaceName: 'Store Management & Analytics Dashboard',
    steps: [
      'Aggregating Multi-Register Sales & Cash Reconciliation...',
      'Loading GSTR-1 Tax Summary & Profit Margin Engine...',
      'Validating Manager Price Override & Void Authorization Keys...',
      'Auditing Daily Shift Summaries & Till Discrepancies...',
      'Launching Store Performance & Executive Financial Reports...'
    ]
  },
  INVENTORY_MANAGER: {
    title: 'Cold Storage & Stock Ledger',
    subtitle: 'Monitoring Chiller Bays, Catch Inward Lots & Wastage',
    icon: '📦',
    themeColor: '#f59e0b',
    bgGlow: 'rgba(245, 158, 11, 0.25)',
    workspaceName: 'Inventory & Catch Lot Management Hub',
    steps: [
      'Checking Cold Storage Chiller Bay Telemetry (-2°C to 2°C)...',
      'Loading Fresh Fish Inward Lots from Bhavanisagar & Cochin...',
      'Calculating Real-Time Cutting Loss & Descaling Yield Rates...',
      'Auditing Safe Holding Expiry & Spoilage Watchlist...',
      'Opening Batch Intake & Stock Reconciliation Console...'
    ]
  },
  ONLINE_ORDER_MANAGER: {
    title: 'Omnichannel Order Dispatch Hub',
    subtitle: 'Connecting Live Web/Mobile Orders with Packing Lines',
    icon: '🛵',
    themeColor: '#06b6d4',
    bgGlow: 'rgba(6, 182, 212, 0.25)',
    workspaceName: 'Online Order Fulfillment & Delivery Kanban',
    steps: [
      'Connecting to Real-Time Customer Order WebSocket Stream...',
      'Loading Active Orders across RS Puram & Coimbatore Zones...',
      'Routing Custom Cutting Slips (Curry Cut, Steaks, Fillets)...',
      'Assigning Insulated Ice-Pack Boxes to Delivery Fleet...',
      'Opening Live 4-Column Fulfillment Kanban Board...'
    ]
  },
  SUPER_ADMIN: {
    title: 'System Governance & Multi-Store',
    subtitle: 'Authorizing 24 DB Schemas, RBAC & Multi-Location Sync',
    icon: '👑',
    themeColor: '#f43f5e',
    bgGlow: 'rgba(244, 63, 94, 0.25)',
    workspaceName: 'SuperAdmin System Infrastructure Console',
    steps: [
      'Authenticating PostgreSQL 24 Database Schema Tables...',
      'Verifying RBAC Permission Matrix & Staff Role Governance...',
      'Synchronizing Multi-Store Franchise Replication Nodes...',
      'Running Database Integrity & Encryption Health Checks...',
      'Launching Full-Stack Platform Governance Suite...'
    ]
  },
  CUSTOMER: {
    title: 'Fresh Seafood Public Storefront',
    subtitle: 'Connecting Sea-to-Kitchen with Live Boat Landings',
    icon: '🛍️',
    themeColor: '#38bdf8',
    bgGlow: 'rgba(56, 189, 248, 0.25)',
    workspaceName: 'Coimbatore Fresh Fish Storefront & Delivery',
    steps: [
      'Fetching Fresh Boat Catch from Cochin Harbor & Bhavanisagar Dam...',
      'Loading Master Fishmonger Cuts (Curry Cut, Steaks, Fillets)...',
      'Checking 100% Chemical-Free & RO Water Quality Standards...',
      'Validating Delivery Slots for RS Puram & Coimbatore Areas...',
      'Opening Sea-to-Kitchen Shopping Experience...'
    ]
  }
};

export const RoleLoadingScreen: React.FC<RoleLoadingScreenProps> = ({
  role,
  fullName,
  terminal,
  onComplete
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  const roleMeta = ROLE_LOADING_DATA[role] || ROLE_LOADING_DATA.CASHIER;

  useEffect(() => {
    // Step-by-step progressive animation
    const stepDuration = 280; // ms per step
    const totalSteps = roleMeta.steps.length;

    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        const next = prev + 1;
        if (next >= totalSteps) {
          clearInterval(interval);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 300);
          return totalSteps - 1;
        }
        return next;
      });
    }, stepDuration);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(100, prev + 4);
      });
    }, 45);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [role, roleMeta.steps.length, onComplete]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(circle at center, #0f172a 0%, #030712 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      overflow: 'hidden'
    }}>
      {/* Background Radial Glow */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: roleMeta.bgGlow,
        filter: 'blur(100px)',
        pointerEvents: 'none',
        animation: 'pulse 2s infinite alternate'
      }} />

      {/* Main Loading Card */}
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '540px',
        background: 'rgba(15, 23, 42, 0.85)',
        borderRadius: 'var(--radius-xl)',
        border: `1.5px solid ${roleMeta.themeColor}`,
        padding: '36px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: `0 20px 50px rgba(0,0,0,0.6), 0 0 30px ${roleMeta.bgGlow}`,
        position: 'relative',
        zIndex: 10
      }}>
        {/* Animated Role Avatar */}
        <div style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          border: `3px solid ${roleMeta.themeColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.8rem',
          boxShadow: `0 0 25px ${roleMeta.themeColor}`,
          marginBottom: '18px',
          animation: 'bounce 1.5s infinite alternate'
        }}>
          {roleMeta.icon}
        </div>

        {/* Role Title & Subtitle */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-block',
            padding: '3px 12px',
            borderRadius: '20px',
            background: `rgba(255, 255, 255, 0.08)`,
            border: `1px solid ${roleMeta.themeColor}`,
            fontSize: '0.72rem',
            fontWeight: 800,
            color: roleMeta.themeColor,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '8px'
          }}>
            {roleMeta.workspaceName}
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
            {fullName ? `Welcome, ${fullName}` : roleMeta.title}
          </h2>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {roleMeta.subtitle}
          </p>

          {terminal && (
            <div style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginTop: '4px',
              fontFamily: 'var(--font-mono)'
            }}>
              Node: {terminal}
            </div>
          )}
        </div>

        {/* Dynamic Checklist Steps */}
        <div style={{
          width: '100%',
          background: 'rgba(3, 7, 18, 0.7)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 18px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {roleMeta.steps.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.76rem',
                  color: isDone ? '#ffffff' : isCurrent ? roleMeta.themeColor : 'var(--text-muted)',
                  fontWeight: isCurrent ? 700 : isDone ? 600 : 400,
                  opacity: isPending ? 0.35 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  background: isDone
                    ? roleMeta.themeColor
                    : isCurrent
                    ? 'transparent'
                    : 'var(--bg-input)',
                  border: `1.5px solid ${isDone ? roleMeta.themeColor : isCurrent ? roleMeta.themeColor : 'var(--border-subtle)'}`,
                  color: isDone ? '#000000' : roleMeta.themeColor
                }}>
                  {isDone ? '✓' : isCurrent ? '⋯' : '○'}
                </div>

                <span style={{ flex: 1 }}>{step}</span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            marginBottom: '6px',
            fontWeight: 700
          }}>
            <span>Initializing Role Environment</span>
            <span className="mono-num" style={{ color: roleMeta.themeColor }}>{progress}%</span>
          </div>

          <div style={{
            width: '100%',
            height: '8px',
            background: 'var(--bg-input)',
            borderRadius: '4px',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${roleMeta.themeColor}, #ffffff)`,
              borderRadius: '4px',
              transition: 'width 0.1s ease',
              boxShadow: `0 0 10px ${roleMeta.themeColor}`
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};
