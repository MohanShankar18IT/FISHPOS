import React from 'react';
import { usePOS } from '../../context/POSContext';
import { OnlineOrder, OnlineOrderStatus } from '../../types';
import { FishImage } from '../common/FishImage';
import {
  CheckCircleIcon,
  ClockIcon,
  KnifeIcon,
  PackageIcon,
  TruckIcon,
  ArrowLeftIcon,
  PhoneIcon,
  MapPinIcon,
  ShieldCheckIcon
} from '../common/Icons';

interface CustomerOrderTrackingProps {
  onBackToStore: () => void;
}

interface StepInfo {
  status: OnlineOrderStatus;
  label: string;
  subtext: string;
  icon: any;
}

const ORDER_STEPS: StepInfo[] = [
  {
    status: 'PENDING',
    label: 'Order Placed',
    subtext: 'Stock reserved in store chiller',
    icon: ClockIcon
  },
  {
    status: 'PROCESSING',
    label: 'Cleaning & Custom Cutting',
    subtext: 'Descaled, gutted & cut in sterile RO water bay',
    icon: KnifeIcon
  },
  {
    status: 'READY',
    label: 'Packed with Flake Ice',
    subtext: 'Sealed in leak-proof insulated box at 0°C - 4°C',
    icon: PackageIcon
  },
  {
    status: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery / Ready',
    subtext: 'Rider on the way / Ready at counter',
    icon: TruckIcon
  },
  {
    status: 'DELIVERED',
    label: 'Delivered Fresh',
    subtext: 'Delivered to your doorstep',
    icon: CheckCircleIcon
  }
];

export const CustomerOrderTracking: React.FC<CustomerOrderTrackingProps> = ({
  onBackToStore
}) => {
  const { onlineOrders, products, activeTrackingOrder, setActiveTrackingOrder } = usePOS();

  // Selected or most recent order
  const order: OnlineOrder | null = activeTrackingOrder || (onlineOrders.length > 0 ? onlineOrders[0] : null);

  const getStepIndex = (status: OnlineOrderStatus): number => {
    switch (status) {
      case 'PENDING':
      case 'CONFIRMED':
        return 0;
      case 'PROCESSING':
        return 1;
      case 'READY':
        return 2;
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };

  if (!order) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ fontSize: '3.5rem' }}>📦</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
          No Active Online Orders
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          You haven't placed an online seafood order yet.
        </p>
        <button
          onClick={onBackToStore}
          style={{
            marginTop: '10px',
            padding: '12px 24px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary)',
            border: 'none',
            color: '#ffffff',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          Explore Fresh Harbor Catch
        </button>
      </div>
    );
  }

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      maxWidth: '900px',
      margin: '0 auto',
      width: '100%',
      padding: '10px 0 40px',
      overflowY: 'auto'
    }}>
      {/* Navigation & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={onBackToStore}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--accent-cyan)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <ArrowLeftIcon size={16} />
          <span>Back to Seafood Store</span>
        </button>

        {/* Order switcher if multiple orders */}
        {onlineOrders.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Switch Order:</span>
            <select
              value={order.id}
              onChange={(e) => {
                const found = onlineOrders.find(o => o.id === e.target.value);
                if (found) setActiveTrackingOrder(found);
              }}
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem'
              }}
            >
              {onlineOrders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} • {o.customerName} ({o.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Order Status Banner */}
      <div className="glass-panel" style={{
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        border: '1px solid var(--border-subtle)',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(15, 23, 42, 0.95))',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Live Order Tracker
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>
              Order #{order.orderNumber}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • For: <strong style={{ color: '#ffffff' }}>{order.customerName}</strong> ({order.customerPhone})
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className={`badge ${
              order.status === 'DELIVERED' ? 'badge-emerald' :
              order.status === 'OUT_FOR_DELIVERY' ? 'badge-cyan' :
              order.status === 'READY' ? 'badge-purple' : 'badge-amber'
            }`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
              {order.status.replace(/_/g, ' ')}
            </span>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {order.deliveryType === 'HOME_DELIVERY' ? '🛵 Home Delivery' : '🏪 Express Counter Pickup'}
            </div>
          </div>
        </div>

        {/* 5-Stage Visual Progress Timeline */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
          padding: '16px 0',
          position: 'relative'
        }}>
          {ORDER_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div
                key={step.status}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '8px',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: isCurrent ? 'var(--accent-cyan)' : isCompleted ? 'var(--accent-emerald)' : 'var(--bg-input)',
                  color: isCurrent || isCompleted ? '#000000' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${isCurrent ? '#ffffff' : isCompleted ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                  boxShadow: isCurrent ? '0 0 15px rgba(6, 182, 212, 0.6)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  <Icon size={20} />
                </div>

                <div style={{ fontSize: '0.78rem', fontWeight: isCurrent ? 800 : 600, color: isCompleted ? '#ffffff' : 'var(--text-muted)' }}>
                  {step.label}
                </div>

                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.2 }}>
                  {step.subtext}
                </div>
              </div>
            );
          })}
        </div>

        {/* Delivery / Store Destination Info Card */}
        <div style={{
          background: 'var(--bg-input)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 18px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)'
            }}>
              <MapPinIcon size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {order.deliveryType === 'HOME_DELIVERY' ? 'Destination Address' : 'Pickup Store Chiller'}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                {order.deliveryAddress || 'Meanomeen Main Chiller Hub, RS Puram, Coimbatore'}
              </div>
              {order.deliverySlot && (
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', marginTop: '2px' }}>
                  Slot: {order.deliverySlot}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              href="tel:+919840123456"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              <PhoneIcon size={14} />
              <span>Call Store</span>
            </a>
          </div>
        </div>
      </div>

      {/* Itemized Order Receipt Card */}
      <div className="glass-panel" style={{
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
          Seafood Order Summary & Invoice
        </h3>

        {/* Items Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {order.items.map((item, idx) => {
            const matchedProd = products.find(p => p.id === item.productId || p.name === item.productName);
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-subtle)',
                    flexShrink: 0
                  }}>
                    <FishImage
                      src={matchedProd?.image_url}
                      alt={item.productName}
                      fallbackIconSize={18}
                      borderRadius="var(--radius-sm)"
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                      {item.productName}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '3px' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                        🔪 {item.cutType}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {item.requestedWeightKg.toFixed(3)} KG @ ₹{item.unitPrice.toFixed(2)}/KG
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mono-num" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                  ₹{item.subtotal.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        {order.specialInstructions && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)'
          }}>
            <strong style={{ color: '#ffffff' }}>Customer Request:</strong> {order.specialInstructions}
          </div>
        )}

        {/* Bill Summary */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>Items Subtotal</span>
            <span className="mono-num">₹{order.subtotal.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>Delivery Charges</span>
            <span className="mono-num">
              {order.deliveryFee === 0 ? <strong style={{ color: 'var(--accent-emerald)' }}>FREE</strong> : `₹${order.deliveryFee.toFixed(2)}`}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>GST Tax (5%)</span>
            <span className="mono-num">₹{order.taxAmount.toFixed(2)}</span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '1.25rem',
            fontWeight: 900,
            color: 'var(--accent-emerald)',
            borderTop: '1px dashed var(--border-subtle)',
            paddingTop: '10px',
            marginTop: '4px'
          }}>
            <span>Total Paid</span>
            <span className="mono-num">₹{order.grandTotal.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>Payment Status:</span>
            <span className={`badge ${order.isPaid ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.68rem' }}>
              {order.isPaid ? `PAID (${order.paymentMethod || 'UPI'})` : 'PAY ON DELIVERY / PICKUP'}
            </span>
          </div>
        </div>

        {/* Chemical Free Quality Guarantee */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(16, 185, 129, 0.08)',
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <ShieldCheckIcon size={20} className="text-emerald-400" />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <strong>Meanomeen Freshness Promise:</strong> 100% formalin-free, whole fresh catch sourced daily directly from traditional harbor boats. Packed in crushed food-grade ice.
          </p>
        </div>
      </div>
    </div>
  );
};
