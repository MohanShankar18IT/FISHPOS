import React from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import { RolePermissionsModal } from './components/auth/RolePermissionsModal';
import { ProductGrid } from './components/pos/ProductGrid';
import { CartSidebar } from './components/pos/CartSidebar';
import { WeightModal } from './components/pos/WeightModal';
import { PaymentModal } from './components/pos/PaymentModal';
import { ReceiptModal } from './components/pos/ReceiptModal';
import { HoldOrdersModal } from './components/pos/HoldOrdersModal';
import { OnlineOrdersBoard } from './components/online/OnlineOrdersBoard';
import { InventoryManager } from './components/inventory/InventoryManager';
import { ShiftSummary } from './components/reports/ShiftSummary';
import { CustomerStorefront } from './components/customer/CustomerStorefront';
import { CustomerOrderTracking } from './components/customer/CustomerOrderTracking';
import { MastersHub } from './components/masters/MastersHub';
import { RoleLoadingScreen } from './components/auth/RoleLoadingScreen';
import { RoleSwitcherModal } from './components/auth/RoleSwitcherModal';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isAuthenticated,
    isRoleLoading,
    loadingRole,
    loadingRoleFullName,
    loadingRoleTerminal,
    dismissRoleLoading
  } = usePOS();

  if (!isAuthenticated && !isRoleLoading) {
    return <LoginPage />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Role-Specific Branded Loading Overlay */}
      {isRoleLoading && (
        <RoleLoadingScreen
          role={loadingRole || 'CASHIER'}
          fullName={loadingRoleFullName}
          terminal={loadingRoleTerminal}
          onComplete={dismissRoleLoading}
        />
      )}
      {/* Top Navbar */}
      <Navbar />

      {/* Main Body Area */}
      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <Sidebar />

        {/* Dynamic Main Workspace */}
        <main style={{
          flex: 1,
          padding: '16px 20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {activeTab === 'pos' && (
            <div style={{ display: 'flex', gap: '16px', height: '100%', overflow: 'hidden' }}>
              <ProductGrid />
              <CartSidebar />
            </div>
          )}

          {activeTab === 'customer-store' && (
            <CustomerStorefront onGoToTracking={() => setActiveTab('customer-tracking')} />
          )}

          {activeTab === 'customer-tracking' && (
            <CustomerOrderTracking onBackToStore={() => setActiveTab('customer-store')} />
          )}

          {activeTab === 'online-orders' && <OnlineOrdersBoard />}
          {activeTab === 'inventory' && <InventoryManager />}
          {activeTab === 'reports' && <ShiftSummary />}
          {activeTab === 'masters' && <MastersHub />}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <WeightModal />
      <PaymentModal />
      <ReceiptModal />
      <HoldOrdersModal />
      <RolePermissionsModal />
      <RoleSwitcherModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <POSProvider>
      <MainLayout />
    </POSProvider>
  );
};

export default App;
