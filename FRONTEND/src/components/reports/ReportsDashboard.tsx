import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { api } from '../../services/api';
import {
  SalesReportSummary,
  SalesRegisterItem,
  PurchaseReportSummary,
  StockReportSummary,
  WastageReportSummary,
  ProfitTaxReport
} from '../../types';
import {
  BarChartIcon,
  DollarIcon,
  PackageIcon,
  TrashIcon,
  PrinterIcon,
  DownloadIcon,
  SearchIcon,
  RefreshCwIcon,
  EyeIcon,
  AlertTriangleIcon,
  XIcon,
  FishIcon,
  PieChartIcon
} from '../common/Icons';

import { FishImage } from '../common/FishImage';

type ReportTab = 'sales' | 'purchases' | 'stock' | 'wastage' | 'shifts' | 'profit-tax';

type DatePreset = 'today' | 'yesterday' | 'week' | 'month' | 'custom' | 'all';

export const ReportsDashboard: React.FC = () => {
  const { currentShift, products } = usePOS();
  const [activeTab, setActiveTab] = useState<ReportTab>('sales');
  const [dateRangePreset, setDateRangePreset] = useState<DatePreset>('today');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Report States
  const [salesSummary, setSalesSummary] = useState<SalesReportSummary | null>(null);
  const [salesRegister, setSalesRegister] = useState<SalesRegisterItem[]>([]);
  const [purchaseSummary, setPurchaseSummary] = useState<PurchaseReportSummary | null>(null);
  const [stockSummary, setStockSummary] = useState<StockReportSummary | null>(null);
  const [wastageSummary, setWastageSummary] = useState<WastageReportSummary | null>(null);
  const [profitTaxSummary, setProfitTaxSummary] = useState<ProfitTaxReport | null>(null);
  const [shiftsList, setShiftsList] = useState<any[]>([]);

  // Filters & Dialogs
  const [searchSales, setSearchSales] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('ALL');
  const [selectedStockCategory] = useState<string>('cat-all');
  const [lowStockOnly, setLowStockOnly] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SalesRegisterItem | null>(null);

  // Shift reconciliation state
  const [actualCashInput, setActualCashInput] = useState<string>(currentShift.expectedCash.toString());
  const [isShiftClosed, setIsShiftClosed] = useState<boolean>(false);

  const numActualCash = parseFloat(actualCashInput) || 0;
  const cashDifference = numActualCash - currentShift.expectedCash;

  // Calculate Start & End Date strings based on preset
  const getDateBounds = () => {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    if (dateRangePreset === 'today') {
      const todayStr = formatDate(today);
      return { start: todayStr, end: todayStr };
    }
    if (dateRangePreset === 'yesterday') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const yStr = formatDate(y);
      return { start: yStr, end: yStr };
    }
    if (dateRangePreset === 'week') {
      const w = new Date(today);
      w.setDate(w.getDate() - 7);
      return { start: formatDate(w), end: formatDate(today) };
    }
    if (dateRangePreset === 'month') {
      const m = new Date(today);
      m.setDate(1);
      return { start: formatDate(m), end: formatDate(today) };
    }
    if (dateRangePreset === 'custom' && customStartDate && customEndDate) {
      return { start: customStartDate, end: customEndDate };
    }
    return { start: undefined, end: undefined };
  };

  // Fetch report data
  const loadReports = async () => {
    setIsLoading(true);
    const { start, end } = getDateBounds();

    try {
      if (activeTab === 'sales') {
        const [summary, register] = await Promise.all([
          api.getSalesReportSummary({ startDate: start, endDate: end }),
          api.getSalesRegister({ startDate: start, endDate: end, paymentMethod: selectedPaymentMethod, search: searchSales })
        ]);
        setSalesSummary(summary);
        setSalesRegister(register);
      } else if (activeTab === 'purchases') {
        const purchases = await api.getPurchaseReport({ startDate: start, endDate: end });
        setPurchaseSummary(purchases);
      } else if (activeTab === 'stock') {
        const stock = await api.getStockReport({ categoryId: selectedStockCategory, lowStockOnly });
        setStockSummary(stock);
      } else if (activeTab === 'wastage') {
        const wastage = await api.getWastageReport({ startDate: start, endDate: end });
        setWastageSummary(wastage);
      } else if (activeTab === 'profit-tax') {
        const pt = await api.getProfitTaxReport({ startDate: start, endDate: end });
        setProfitTaxSummary(pt);
      } else if (activeTab === 'shifts') {
        const shifts = await api.getShiftsReport({ startDate: start, endDate: end });
        setShiftsList(shifts);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [activeTab, dateRangePreset, selectedPaymentMethod, selectedStockCategory, lowStockOnly]);

  // CSV Export Utility
  const exportToCSV = () => {
    const filename = `fish-pos-${activeTab}-report-${new Date().toISOString().split('T')[0]}.csv`;
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'sales') {
      csvContent += 'Sale Number,Date Time,Cashier,Customer,Payment Methods,Items Count,Subtotal (INR),Discount (INR),Tax 5% (INR),Grand Total (INR)\n';
      salesRegister.forEach(s => {
        csvContent += `"${s.saleNumber}","${s.createdAt}","${s.cashierName}","${s.customerName}","${s.paymentMethods.join('/')}","${s.itemsCount}","${s.subtotal.toFixed(2)}","${s.discountAmount.toFixed(2)}","${s.taxAmount.toFixed(2)}","${s.grandTotal.toFixed(2)}"\n`;
      });
    } else if (activeTab === 'purchases' && purchaseSummary) {
      csvContent += 'Lot Number,Fish Product,Supplier,Landing Port,Received Weight (KG),Cost Per KG (INR),Total Value (INR),Arrival Date\n';
      purchaseSummary.lots.forEach(l => {
        csvContent += `"${l.lotNumber}","${l.productName}","${l.supplierName}","${l.landingPort}","${l.receivedWeightKg.toFixed(3)}","${l.costPerKg.toFixed(2)}","${l.totalValue.toFixed(2)}","${l.receivedAt}"\n`;
      });
    } else if (activeTab === 'stock' && stockSummary) {
      csvContent += 'SKU,Product Name,Local Name,Category,Cost Price (INR),Selling Price (INR),Physical Stock (KG),Reserved (KG),Available (KG),Stock Cost Valuation (INR),Retail Valuation (INR)\n';
      stockSummary.items.forEach(i => {
        csvContent += `"${i.sku}","${i.productName}","${i.localName || ''}","${i.categoryName}","${i.costPrice.toFixed(2)}","${i.sellingPrice.toFixed(2)}","${i.physicalStock.toFixed(3)}","${i.reservedStock.toFixed(3)}","${i.availableStock.toFixed(3)}","${i.costValuation.toFixed(2)}","${i.retailValuation.toFixed(2)}"\n`;
      });
    } else if (activeTab === 'wastage' && wastageSummary) {
      csvContent += 'Product Name,Reason,Weight Lost (KG),Estimated Loss Value (INR),Notes,Logged At\n';
      wastageSummary.records.forEach(w => {
        csvContent += `"${w.productName}","${w.wastageReason}","${w.quantityKg.toFixed(3)}","${w.estimatedLossValue.toFixed(2)}","${w.notes || ''}","${w.createdAt}"\n`;
      });
    } else if (activeTab === 'shifts') {
      csvContent += 'Register,Cashier,Status,Opened At,Closed At,Opening Float (INR),Cash Sales (INR),Card Sales (INR),UPI Sales (INR),Total Sales (INR),Discrepancy (INR)\n';
      shiftsList.forEach(sh => {
        csvContent += `"${sh.registerNumber}","${sh.cashierName}","${sh.status}","${sh.openedAt}","${sh.closedAt || 'Active'}","${sh.openingCash}","${sh.cashSalesAmount}","${sh.cardSalesAmount}","${sh.upiSalesAmount}","${sh.totalSalesAmount}","${sh.cashDifference || 0}"\n`;
      });
    } else if (activeTab === 'profit-tax' && profitTaxSummary) {
      csvContent += 'Metric,Amount (INR)\n';
      csvContent += `"Gross Revenue","${profitTaxSummary.totalGrossRevenue.toFixed(2)}"\n`;
      csvContent += `"Taxable Turnover","${profitTaxSummary.taxableTurnover.toFixed(2)}"\n`;
      csvContent += `"Cost of Goods Sold (COGS)","${profitTaxSummary.costOfGoodsSold.toFixed(2)}"\n`;
      csvContent += `"Gross Profit","${profitTaxSummary.grossProfit.toFixed(2)}"\n`;
      csvContent += `"Gross Margin %","${profitTaxSummary.grossMarginPct}%"\n`;
      csvContent += `"CGST (2.5%)","${profitTaxSummary.cgstAmount25.toFixed(2)}"\n`;
      csvContent += `"SGST (2.5%)","${profitTaxSummary.sgstAmount25.toFixed(2)}"\n`;
      csvContent += `"Total GST (5%)","${profitTaxSummary.totalTaxCollected.toFixed(2)}"\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseShift = () => {
    if (confirm(`Confirm closing register shift ${currentShift.registerNumber}? Cash discrepancy is ₹${cashDifference.toFixed(2)}`)) {
      setIsShiftClosed(true);
      alert("Register shift closed successfully and frozen for day audit!");
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      flex: 1,
      height: '100%',
      overflowY: 'auto'
    }}>
      {/* Header & Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--accent-cyan)',
            boxShadow: 'var(--shadow-glow)',
            flexShrink: 0
          }}>
            <img src="/logo.jpg" alt="meanOmeen" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
              Reports, Audit & Business Intelligence
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Sales, Fresh Catch Purchases, Stock Valuation, Spoilage & Gut Loss, and GST Compliance
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Date Presets */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            padding: '3px',
            alignItems: 'center',
            gap: '2px'
          }}>
            {(['today', 'yesterday', 'week', 'month', 'custom', 'all'] as const).map(preset => (
              <button
                key={preset}
                onClick={() => setDateRangePreset(preset)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: dateRangePreset === preset ? 'var(--primary)' : 'transparent',
                  color: dateRangePreset === preset ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: dateRangePreset === preset ? 700 : 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {preset === 'week' ? '7 Days' : preset === 'month' ? 'This Month' : preset}
              </button>
            ))}
          </div>

          {dateRangePreset === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', padding: '3px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  padding: '4px 6px',
                  fontSize: '0.75rem'
                }}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  padding: '4px 6px',
                  fontSize: '0.75rem'
                }}
              />
            </div>
          )}

          <button
            onClick={loadReports}
            title="Refresh Report Data"
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <RefreshCwIcon size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportToCSV}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--accent-cyan)',
              color: 'var(--accent-cyan)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 700
            }}
          >
            <DownloadIcon size={15} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 700,
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <PrinterIcon size={15} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {[
          { id: 'sales' as const, label: 'Sales Reports & Register', icon: BarChartIcon },
          { id: 'purchases' as const, label: 'Purchase & Landings', icon: FishIcon },
          { id: 'stock' as const, label: 'Stock & Valuation', icon: PackageIcon },
          { id: 'wastage' as const, label: 'Cutting Loss & Wastage', icon: TrashIcon },
          { id: 'shifts' as const, label: 'Shift Z-Reports & Cash', icon: DollarIcon },
          { id: 'profit-tax' as const, label: 'Profitability & GST (Tax)', icon: PieChartIcon },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                background: isActive ? 'var(--bg-card)' : 'transparent',
                borderBottom: `2px solid ${isActive ? 'var(--accent-cyan)' : 'transparent'}`,
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <Icon size={17} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------- TAB 1: SALES REPORT ---------------- */}
      {activeTab === 'sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* KPI Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gross Revenue</span>
              <div className="mono-num" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
                ₹{salesSummary?.grossSales.toFixed(2) || '0.00'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {salesSummary?.transactionCount || 0} Bills Completed
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Sales (Excl. Tax)</span>
              <div className="mono-num" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                ₹{salesSummary?.netSales.toFixed(2) || '0.00'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Base fish revenue
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>GST 5% Collected</span>
              <div className="mono-num" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
                ₹{salesSummary?.totalTax.toFixed(2) || '0.00'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                CGST 2.5% + SGST 2.5%
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Ticket Size</span>
              <div className="mono-num" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '4px' }}>
                ₹{salesSummary?.averageBasketSize.toFixed(2) || '0.00'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Per retail transaction
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Discounts</span>
              <div className="mono-num" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-rose)', marginTop: '4px' }}>
                ₹{salesSummary?.totalDiscount.toFixed(2) || '0.00'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Markdowns & Promotions
              </span>
            </div>
          </div>

          {/* Breakdown Row: Payment Modes & Top Products */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
            {/* Payment Modes Split */}
            <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                Settlement & Payment Modes
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>UPI / QR Codes</span>
                    <span className="mono-num" style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      ₹{salesSummary?.paymentBreakdown.upi.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${salesSummary ? (salesSummary.paymentBreakdown.upi / (salesSummary.paymentBreakdown.total || 1)) * 100 : 0}%`,
                      height: '100%',
                      background: 'var(--accent-cyan)'
                    }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Cash Drawer</span>
                    <span className="mono-num" style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      ₹{salesSummary?.paymentBreakdown.cash.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${salesSummary ? (salesSummary.paymentBreakdown.cash / (salesSummary.paymentBreakdown.total || 1)) * 100 : 0}%`,
                      height: '100%',
                      background: 'var(--accent-emerald)'
                    }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Credit / Debit Cards (EDC)</span>
                    <span className="mono-num" style={{ fontWeight: 700, color: 'var(--accent-purple)' }}>
                      ₹{salesSummary?.paymentBreakdown.card.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${salesSummary ? (salesSummary.paymentBreakdown.card / (salesSummary.paymentBreakdown.total || 1)) * 100 : 0}%`,
                      height: '100%',
                      background: 'var(--accent-purple)'
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Fish Varieties Sold */}
            <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                Top 5 Fish Varieties by Revenue
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                {salesSummary?.topProducts.map((tp, idx) => {
                  const matchedProd = products.find(p => p.id === tp.productId || p.name === tp.productName);
                  return (
                    <div key={tp.productId} style={{
                      background: 'var(--bg-input)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                          <FishImage src={matchedProd?.image_url} alt={tp.productName} fallbackIconSize={16} borderRadius="var(--radius-sm)" />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', fontWeight: 700, display: 'block' }}>#{idx + 1} BESTSELLER</span>
                          <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff', marginTop: '1px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {tp.productName.split('/')[0]}
                          </h4>
                        </div>
                      </div>
                      <div>
                        <div className="mono-num" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                          ₹{tp.revenue.toFixed(0)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          {tp.weightKg.toFixed(2)} KG • {tp.orderCount} bills
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sales Register Table with Search & Filters */}
          <div className="glass-panel" style={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                  Sales Invoices & Transactions Register
                </h3>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                  {salesRegister.length} Records
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {/* Search Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-input)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  width: '220px'
                }}>
                  <SearchIcon size={14} />
                  <input
                    type="text"
                    placeholder="Search bill # or customer..."
                    value={searchSales}
                    onChange={(e) => setSearchSales(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      marginLeft: '8px',
                      outline: 'none',
                      width: '100%'
                    }}
                  />
                </div>

                {/* Payment Method Filter */}
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8rem'
                  }}
                >
                  <option value="ALL">All Payment Modes</option>
                  <option value="CASH">Cash Only</option>
                  <option value="UPI">UPI Only</option>
                  <option value="CARD">Card Only</option>
                </select>
              </div>
            </div>

            {/* Sales Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderBottom: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '0.72rem',
                    textTransform: 'uppercase'
                  }}>
                    <th style={{ padding: '10px 14px' }}>Bill # & Time</th>
                    <th style={{ padding: '10px 14px' }}>Customer</th>
                    <th style={{ padding: '10px 14px' }}>Cashier</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Items</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Subtotal</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Discount</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Tax (5%)</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Grand Total</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Mode</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {salesRegister.map(sale => (
                    <tr
                      key={sale.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{sale.saleNumber}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>{sale.customerName}</div>
                        {sale.customerPhone && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sale.customerPhone}</div>
                        )}
                      </td>

                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                        {sale.cashierName}
                      </td>

                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                          {sale.itemsCount} lines
                        </span>
                      </td>

                      <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', color: '#ffffff' }}>
                        ₹{sale.subtotal.toFixed(2)}
                      </td>

                      <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--accent-rose)' }}>
                        {sale.discountAmount > 0 ? `-₹${sale.discountAmount.toFixed(2)}` : '₹0.00'}
                      </td>

                      <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                        ₹{sale.taxAmount.toFixed(2)}
                      </td>

                      <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                        ₹{sale.grandTotal.toFixed(2)}
                      </td>

                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>
                          {sale.paymentMethods.join(' / ') || 'PAID'}
                        </span>
                      </td>

                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedInvoice(sale)}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--accent-cyan)',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <EyeIcon size={12} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 2: PURCHASE & HARBOR LANDINGS ---------------- */}
      {activeTab === 'purchases' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Purchase KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Purchase Spend</span>
              <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
                ₹{purchaseSummary?.totalSpend.toFixed(2) || '0.00'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Fresh Catch Procurement
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Weight Received</span>
              <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                {purchaseSummary?.totalWeightKg.toFixed(3) || '0.000'} KG
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Landed Catch Weight
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Average Landed Cost</span>
              <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '4px' }}>
                ₹{purchaseSummary?.averageCostPerKg.toFixed(2) || '0.00'} / KG
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Weighted Average Price
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Lots Received</span>
              <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
                {purchaseSummary?.activeLotsCount || 0} Lots
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Traceable boat batches
              </span>
            </div>
          </div>

          {/* Supplier Breakdown Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {purchaseSummary?.supplierBreakdown.map(sup => (
              <div key={sup.supplierName} className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>{sup.supplierName}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{sup.landingPort}</p>
                  </div>
                  <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                    {sup.lotsCount} Lots
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Volume</span>
                    <div className="mono-num" style={{ fontWeight: 700, color: '#ffffff' }}>
                      {sup.totalWeightKg.toFixed(3)} KG
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Spend</span>
                    <div className="mono-num" style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      ₹{sup.totalSpend.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lots Table */}
          <div className="glass-panel" style={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '16px',
            overflowX: 'auto'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
              Fresh Catch Lot Intake Ledger
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  textTransform: 'uppercase'
                }}>
                  <th style={{ padding: '10px 14px' }}>Lot #</th>
                  <th style={{ padding: '10px 14px' }}>Fish Variety</th>
                  <th style={{ padding: '10px 14px' }}>Supplier / Harbor</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Received Weight</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Cost / KG</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total Lot Value</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Arrival Date</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Expiry Alert</th>
                </tr>
              </thead>
              <tbody>
                {purchaseSummary?.lots.map(lot => (
                  <tr key={lot.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {lot.lotNumber}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#ffffff' }}>
                      {lot.productName}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                      <div>{lot.supplierName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{lot.landingPort}</div>
                    </td>
                    <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: '#ffffff' }}>
                      {lot.receivedWeightKg.toFixed(3)} KG
                    </td>
                    <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      ₹{lot.costPerKg.toFixed(2)}
                    </td>
                    <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      ₹{lot.totalValue.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {new Date(lot.receivedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                        Fresh Catch ✓
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- TAB 3: STOCK & VALUATION ---------------- */}
      {activeTab === 'stock' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Stock KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Asset Value (At Cost)</span>
              <div className="mono-num" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
                ₹{stockSummary?.totalCostValuation.toFixed(2) || '0.00'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Inventory Capital Invested
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Retail Valuation</span>
              <div className="mono-num" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
                ₹{stockSummary?.totalRetailValuation.toFixed(2) || '0.00'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Projected Selling Value
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Potential Margin</span>
              <div className="mono-num" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '4px' }}>
                {stockSummary?.potentialGrossMarginPct || 0}%
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Gross Markup Margin
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Physical Stock</span>
              <div className="mono-num" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                {stockSummary?.totalPhysicalWeightKg.toFixed(3) || '0.000'} KG
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Across {stockSummary?.totalItemsCount || 0} products
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Low Stock Warnings</span>
              <div className="mono-num" style={{ fontSize: '1.45rem', fontWeight: 800, color: stockSummary && stockSummary.lowStockCount > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)', marginTop: '4px' }}>
                {stockSummary?.lowStockCount || 0} Items
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Below reorder threshold
              </span>
            </div>
          </div>

          {/* Stock Table with Filter */}
          <div className="glass-panel" style={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                Real-Time Physical & Available Stock Valuation
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={lowStockOnly}
                    onChange={(e) => setLowStockOnly(e.target.checked)}
                  />
                  <span>Show Low Stock Only</span>
                </label>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderBottom: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '0.72rem',
                    textTransform: 'uppercase'
                  }}>
                    <th style={{ padding: '10px 14px' }}>SKU</th>
                    <th style={{ padding: '10px 14px' }}>Fish Variety & Local Name</th>
                    <th style={{ padding: '10px 14px' }}>Category</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Cost Price</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Selling Rate</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Physical Stock</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Reserved</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Available</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Cost Valuation</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Retail Valuation</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Health</th>
                  </tr>
                </thead>
                <tbody>
                  {stockSummary?.items.map(item => {
                    const matchedProd = products.find(p => p.id === item.productId || p.name === item.productName);
                    return (
                      <tr key={item.productId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-muted)' }}>
                          {item.sku}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                              <FishImage src={matchedProd?.image_url} alt={item.productName} fallbackIconSize={16} borderRadius="var(--radius-sm)" />
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: '#ffffff' }}>{item.productName}</div>
                              {item.localName && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{item.localName}</div>
                              )}
                            </div>
                          </div>
                        </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                          {item.categoryName}
                        </span>
                      </td>
                      <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                        ₹{item.costPrice.toFixed(2)}
                      </td>
                      <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--accent-emerald)' }}>
                        ₹{item.sellingPrice.toFixed(2)}
                      </td>
                      <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: '#ffffff' }}>
                        {item.physicalStock.toFixed(3)} {item.unitType}
                      </td>
                      <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--accent-amber)' }}>
                        {item.reservedStock.toFixed(3)}
                      </td>
                      <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: item.isLowStock ? 'var(--accent-rose)' : 'var(--accent-cyan)' }}>
                        {item.availableStock.toFixed(3)} {item.unitType}
                      </td>
                      <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                        ₹{item.costValuation.toFixed(2)}
                      </td>
                      <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                        ₹{item.retailValuation.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        {item.isLowStock ? (
                          <span className="badge badge-rose" style={{ fontSize: '0.65rem' }}>
                            <AlertTriangleIcon size={12} /> Low
                          </span>
                        ) : (
                          <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                            Good ✓
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 4: WASTAGE & CUTTING LOSS ---------------- */}
      {activeTab === 'wastage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Wastage KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Weight Lost</span>
              <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-rose)', marginTop: '4px' }}>
                {wastageSummary?.totalWastageKg.toFixed(3) || '0.000'} KG
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {wastageSummary?.entriesCount || 0} Incident records
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estimated Loss Value</span>
              <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-rose)', marginTop: '4px' }}>
                ₹{wastageSummary?.totalLossValue.toFixed(2) || '0.00'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Cost price financial impact
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Primary Loss Factor</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
                Gutting & Cutting Loss
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Head, gill & scale removal
              </span>
            </div>
          </div>

          {/* Reason Breakdown Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {wastageSummary?.breakdownByReason.map(r => (
              <div key={r.reason} className="glass-panel" style={{ padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
                    {r.reason.replace('_', ' ')}
                  </span>
                  <span className="badge badge-rose" style={{ fontSize: '0.68rem' }}>
                    {r.count} Logs
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span className="mono-num" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                    {r.weightKg.toFixed(3)} KG
                  </span>
                  <span className="mono-num" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
                    ₹{r.lossValue.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Wastage Logs Table */}
          <div className="glass-panel" style={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '16px',
            overflowX: 'auto'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
              Immutable Wastage & Spoilage Audit Log
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  textTransform: 'uppercase'
                }}>
                  <th style={{ padding: '10px 14px' }}>Fish Variety</th>
                  <th style={{ padding: '10px 14px' }}>Reason</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Weight Lost</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Est. Loss (INR)</th>
                  <th style={{ padding: '10px 14px' }}>Notes & Manager Remarks</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {wastageSummary?.records.map(rec => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#ffffff' }}>
                      {rec.productName}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className="badge badge-rose" style={{ fontSize: '0.68rem' }}>
                        {rec.wastageReason.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--accent-rose)' }}>
                      {rec.quantityKg.toFixed(3)} KG
                    </td>
                    <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--accent-rose)' }}>
                      ₹{rec.estimatedLossValue.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                      {rec.notes || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- TAB 5: SHIFTS & Z-REPORTS ---------------- */}
      {activeTab === 'shifts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Active Shift Balancing Card */}
          <div className="glass-panel" style={{
            borderRadius: 'var(--radius-xl)',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                  Register Shift #{currentShift.registerNumber} • Cashier: {currentShift.cashierName}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Opened: {new Date(currentShift.openedAt).toLocaleTimeString()} • Status: <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>ACTIVE</span>
                </p>
              </div>

              <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                OPEN REGISTER
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Opening Float</span>
                <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                  ₹{currentShift.openingCash.toFixed(2)}
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>System Expected Cash</span>
                <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                  ₹{currentShift.expectedCash.toFixed(2)}
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Counted Cash (₹)</span>
                <input
                  type="number"
                  value={actualCashInput}
                  onChange={(e) => setActualCashInput(e.target.value)}
                  disabled={isShiftClosed}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Discrepancy</span>
                <div className="mono-num" style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: cashDifference === 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                }}>
                  {cashDifference >= 0 ? `+₹${cashDifference.toFixed(2)}` : `-₹${Math.abs(cashDifference).toFixed(2)}`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                disabled={isShiftClosed}
                onClick={handleCloseShift}
                style={{
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-md)',
                  background: isShiftClosed ? 'var(--bg-input)' : 'var(--accent-rose)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: isShiftClosed ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {isShiftClosed ? 'Shift Closed & Audited' : 'End & Close Register Shift'}
              </button>
            </div>
          </div>

          {/* Historical Shifts Table */}
          <div className="glass-panel" style={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '16px',
            overflowX: 'auto'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
              Register Shift History & Z-Reports Log
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  textTransform: 'uppercase'
                }}>
                  <th style={{ padding: '10px 14px' }}>Register #</th>
                  <th style={{ padding: '10px 14px' }}>Cashier</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Float</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Cash Sales</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>UPI Sales</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Card Sales</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total Gross</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Discrepancy</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Z-Report</th>
                </tr>
              </thead>
              <tbody>
                {shiftsList.map(sh => (
                  <tr key={sh.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {sh.registerNumber}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#ffffff' }}>
                      {sh.cashierName}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className={`badge ${sh.status === 'OPEN' ? 'badge-emerald' : 'badge-slate'}`} style={{ fontSize: '0.68rem' }}>
                        {sh.status}
                      </span>
                    </td>
                    <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      ₹{Number(sh.openingCash).toFixed(2)}
                    </td>
                    <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--accent-emerald)' }}>
                      ₹{Number(sh.cashSalesAmount).toFixed(2)}
                    </td>
                    <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--accent-cyan)' }}>
                      ₹{Number(sh.upiSalesAmount).toFixed(2)}
                    </td>
                    <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--accent-purple)' }}>
                      ₹{Number(sh.cardSalesAmount).toFixed(2)}
                    </td>
                    <td className="mono-num" style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#ffffff' }}>
                      ₹{Number(sh.totalSalesAmount).toFixed(2)}
                    </td>
                    <td className="mono-num" style={{
                      padding: '10px 14px',
                      textAlign: 'right',
                      fontWeight: 700,
                      color: Number(sh.cashDifference || 0) === 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                    }}>
                      ₹{Number(sh.cashDifference || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <button
                        onClick={() => window.print()}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <PrinterIcon size={12} />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- TAB 6: PROFIT & TAX (GST) ---------------- */}
      {activeTab === 'profit-tax' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Profit & Tax KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Taxable Sales Turnover</span>
              <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                ₹{profitTaxSummary?.taxableTurnover.toFixed(2) || '0.00'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Revenue before tax
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cost of Goods Sold (COGS)</span>
              <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '4px' }}>
                ₹{profitTaxSummary?.costOfGoodsSold.toFixed(2) || '0.00'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Direct fish procurement cost
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gross Profit</span>
              <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
                ₹{profitTaxSummary?.grossProfit.toFixed(2) || '0.00'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {profitTaxSummary?.grossMarginPct || 0}% Gross Margin
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total GST Collected (5%)</span>
              <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
                ₹{profitTaxSummary?.totalTaxCollected.toFixed(2) || '0.00'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Output tax liability
              </span>
            </div>
          </div>

          {/* GST Tax Filing Summary Card */}
          <div className="glass-panel" style={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
              GST Compliance Breakdown (CGST 2.5% & SGST 2.5%)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Central GST (CGST @ 2.5%)</span>
                <div className="mono-num" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
                  ₹{profitTaxSummary?.cgstAmount25.toFixed(2) || '0.00'}
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Central Government Seafood Duty
                </p>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>State GST (SGST @ 2.5%)</span>
                <div className="mono-num" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
                  ₹{profitTaxSummary?.sgstAmount25.toFixed(2) || '0.00'}
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Tamil Nadu State Tax Component
                </p>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Tax Liability (5%)</span>
                <div className="mono-num" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
                  ₹{profitTaxSummary?.totalTaxCollected.toFixed(2) || '0.00'}
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-emerald)', marginTop: '4px' }}>
                  Ready for GSTR-1 & GSTR-3B Filing
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Dialog Modal */}
      {selectedInvoice && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 10, 20, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '560px',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  Bill #{selectedInvoice.saleNumber}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(selectedInvoice.createdAt).toLocaleString()} • Cashier: {selectedInvoice.cashierName}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <XIcon size={20} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Customer</span>
              <div style={{ fontWeight: 700, color: '#ffffff' }}>
                {selectedInvoice.customerName} {selectedInvoice.customerPhone && `(${selectedInvoice.customerPhone})`}
              </div>
            </div>

            {/* Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {selectedInvoice.items.map((it, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem' }}>{it.productName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Cut: {it.cutType} • {it.weightKg.toFixed(3)} KG @ ₹{it.unitPrice.toFixed(2)}/KG
                    </div>
                  </div>
                  <div className="mono-num" style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '0.9rem' }}>
                    ₹{it.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary Footer */}
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span className="mono-num">₹{selectedInvoice.subtotal.toFixed(2)}</span>
              </div>
              {selectedInvoice.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--accent-rose)' }}>
                  <span>Discount</span>
                  <span className="mono-num">-₹{selectedInvoice.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>GST Tax (5%)</span>
                <span className="mono-num">₹{selectedInvoice.taxAmount.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.1rem',
                fontWeight: 800,
                color: 'var(--accent-emerald)',
                borderTop: '1px dashed var(--border-subtle)',
                paddingTop: '6px',
                marginTop: '4px'
              }}>
                <span>Grand Total</span>
                <span className="mono-num">₹{selectedInvoice.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard;
