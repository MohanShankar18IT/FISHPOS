import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class OnlineOrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    PROCESSING = "PROCESSING"  # Fish cleaning & cutting in progress
    READY = "READY"            # Packed and stored in chiller
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    REFUNDED = "REFUNDED"


class DeliveryType(str, enum.Enum):
    HOME_DELIVERY = "HOME_DELIVERY"
    STORE_PICKUP = "STORE_PICKUP"


class OnlineOrder(Base):
    """
    Phase 2 Online Order supporting lifecycle transitions and stock reservation.
    """
    __tablename__ = "online_orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    store_id = Column(String(36), ForeignKey("stores.id"), nullable=False)

    status = Column(SAEnum(OnlineOrderStatus), default=OnlineOrderStatus.PENDING, nullable=False)
    delivery_type = Column(SAEnum(DeliveryType), default=DeliveryType.HOME_DELIVERY, nullable=False)

    delivery_address = Column(Text, nullable=True)
    delivery_slot = Column(String(50), nullable=True)  # e.g., "Today 05:00 PM - 07:00 PM"
    special_instructions = Column(Text, nullable=True)

    subtotal = Column(Numeric(12, 2), nullable=False)
    delivery_fee = Column(Numeric(12, 2), default=0.00, nullable=False)
    discount_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    tax_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    grand_total = Column(Numeric(12, 2), nullable=False)

    is_paid = Column(Numeric(1, 0), default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    customer = relationship("Customer", back_populates="online_orders")
    items = relationship("OnlineOrderItem", back_populates="order", cascade="all, delete-orphan")
    reservations = relationship("StockReservation", back_populates="order", cascade="all, delete-orphan")


class OnlineOrderItem(Base):
    __tablename__ = "online_order_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("online_orders.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)

    product_name = Column(String(150), nullable=False)
    cut_type = Column(String(50), default="Curry Cut", nullable=False)
    requested_weight_kg = Column(Numeric(12, 3), nullable=False)
    actual_weight_kg = Column(Numeric(12, 3), nullable=True)  # Populated when weighted & packed
    unit_price = Column(Numeric(12, 2), nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)

    # Relationships
    order = relationship("OnlineOrder", back_populates="items")


class StockReservation(Base):
    """
    Reserved stock tracker for active online orders to prevent overselling.
    """
    __tablename__ = "stock_reservations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("online_orders.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    store_id = Column(String(36), ForeignKey("stores.id"), nullable=False)
    reserved_weight_kg = Column(Numeric(12, 3), nullable=False)
    is_active = Column(Numeric(1, 0), default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    order = relationship("OnlineOrder", back_populates="reservations")
