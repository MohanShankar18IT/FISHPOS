import React from 'react';
import { usePOS } from '../../context/POSContext';
import { OnlineOrderStatus } from '../../types';
import { FishImage } from '../common/FishImage';
import { ShoppingCartIcon, ClockIcon, CheckCircleIcon, KnifeIcon, PackageIcon } from '../common/Icons';

export const OnlineOrdersBoard: React.FC = () => {
  const { onlineOrders, products, updateOrderStatus } = usePOS();

  const columns: { status: OnlineOrderStatus; label: string; badgeClass: string; icon: any }[] = [
    { status: 'PENDING', label: 'Incoming Orders', badgeClass: 'badge-amber', icon: ClockIcon },
    { status: 'PROCESSING', label: 'Cutting & Cleaning', badgeClass: 'badge-cyan', icon: KnifeIcon },
    { status: 'READY', label: 'Packed in Chiller', badgeClass: 'badge-purple', icon: PackageIcon },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', badgeClass: 'badge-cyan', icon: ShoppingCartIcon },
    { status: 'DELIVERED', label: 'Completed / Handed Over', badgeClass: 'badge-emerald', icon: CheckCircleIcon }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      flex: 1,
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
            Online Orders Fulfillment Hub
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Phase 2 Omnichannel order management with real-time stock reservations
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge badge-emerald">
            Auto-Reserve Online Stock: ON
          </span>
          <span className="badge badge-cyan">
            Active Orders: {onlineOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length}
          </span>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '12px',
        flex: 1,
        overflowX: 'auto',
        overflowY: 'hidden'
      }}>
        {columns.map(col => {
          const ColIcon = col.icon;
          const colOrders = onlineOrders.filter(o => o.status === col.status);

          return (
            <div
              key={col.status}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                minWidth: '240px'
              }}
            >
              {/* Column Header */}
              <div style={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ColIcon size={16} className="text-sky-400" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                    {col.label}
                  </span>
                </div>
                <span className={`badge ${col.badgeClass}`} style={{ fontSize: '0.68rem' }}>
                  {colOrders.length}
                </span>
              </div>

              {/* Column Cards */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                {colOrders.length === 0 ? (
                  <div style={{
                    padding: '24px 10px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem'
                  }}>
                    No orders in this stage
                  </div>
                ) : (
                  colOrders.map(order => (
                    <div
                      key={order.id}
                      style={{
                        background: 'var(--bg-input)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      {/* Order Number & Meta */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                            {order.orderNumber}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                            {order.customerName}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {order.customerPhone}
                          </div>
                        </div>

                        <span className={`badge ${order.deliveryType === 'HOME_DELIVERY' ? 'badge-cyan' : 'badge-purple'}`} style={{ fontSize: '0.62rem' }}>
                          {order.deliveryType === 'HOME_DELIVERY' ? 'Delivery' : 'Pickup'}
                        </span>
                      </div>

                      {/* Line Items with Cut Instruction */}
                      <div style={{
                        background: 'var(--bg-card)',
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        {order.items.map((item, i) => {
                          const matchedProd = products.find(p => p.id === item.productId || p.name === item.productName);
                          return (
                            <div key={i} style={{ fontSize: '0.72rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '22px', height: '22px', borderRadius: '3px', overflow: 'hidden', flexShrink: 0 }}>
                                  <FishImage src={matchedProd?.image_url} alt={item.productName} fallbackIconSize={12} borderRadius="3px" />
                                </div>
                                <span style={{ color: 'var(--text-primary)' }}>
                                  <strong>{item.requestedWeightKg.toFixed(3)}kg</strong> {item.productName}
                                </span>
                              </div>
                              <span className="badge badge-purple" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>
                                {item.cutType}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Total & Paid status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Amount:</span>
                        <strong className="mono-num" style={{ color: 'var(--accent-emerald)', fontSize: '0.9rem' }}>
                          ₹{order.grandTotal.toFixed(2)}
                        </strong>
                      </div>

                      {/* Transition Action Buttons */}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
                            style={{
                              flex: 1,
                              padding: '6px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--primary)',
                              border: 'none',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              cursor: 'pointer'
                            }}
                          >
                            Accept & Start Cut
                          </button>
                        )}

                        {order.status === 'PROCESSING' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'READY')}
                            style={{
                              flex: 1,
                              padding: '6px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--accent-purple)',
                              border: 'none',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              cursor: 'pointer'
                            }}
                          >
                            Pack & Move to Chiller
                          </button>
                        )}

                        {order.status === 'READY' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
                            style={{
                              flex: 1,
                              padding: '6px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--accent-cyan)',
                              color: '#000000',
                              border: 'none',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              cursor: 'pointer'
                            }}
                          >
                            Hand to Rider
                          </button>
                        )}

                        {order.status === 'OUT_FOR_DELIVERY' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                            style={{
                              flex: 1,
                              padding: '6px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--accent-emerald)',
                              border: 'none',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              cursor: 'pointer'
                            }}
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
