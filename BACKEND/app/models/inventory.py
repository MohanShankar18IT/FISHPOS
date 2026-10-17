import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey, Enum as SAEnum, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class MovementType(str, enum.Enum):
    OPENING = "OPENING"
    PURCHASE = "PURCHASE"
    SALE = "SALE"
    SALE_RETURN = "SALE_RETURN"
    PURCHASE_RETURN = "PURCHASE_RETURN"
    ADJUSTMENT = "ADJUSTMENT"
    TRANSFER_IN = "TRANSFER_IN"
    TRANSFER_OUT = "TRANSFER_OUT"
    WASTAGE = "WASTAGE"
    RESERVATION = "RESERVATION"
    RELEASE = "RELEASE"


class WastageReason(str, enum.Enum):
    SPOILAGE = "SPOILAGE"
    CUTTING_LOSS = "CUTTING_LOSS"
    ICE_MELT = "ICE_MELT"
    EXPIRED = "EXPIRED"
    DAMAGED = "DAMAGED"


class BatchLot(Base):
    """
    Fresh catch batch/lot details with harvest origin and expiry.
    """
    __tablename__ = "batch_lots"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lot_number = Column(String(50), unique=True, index=True, nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    supplier_name = Column(String(100), nullable=True)
    landing_port = Column(String(100), nullable=True)  # e.g., Kasimedu / Cochin Harbor
    received_weight_kg = Column(Numeric(12, 3), nullable=False)
    cost_per_kg = Column(Numeric(12, 2), nullable=False)
    received_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expiry_date = Column(DateTime, nullable=True)

    # Relationships
    movements = relationship("InventoryMovement", back_populates="batch")


class Inventory(Base):
    """
    Real-time stock balance per store and product.
    Available = Physical - Reserved.
    """
    __tablename__ = "inventory"
    __table_args__ = (UniqueConstraint("product_id", "store_id", name="uq_product_store_inventory"),)

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    store_id = Column(String(36), ForeignKey("stores.id"), nullable=False)

    physical_stock = Column(Numeric(12, 3), default=0.000, nullable=False)
    reserved_stock = Column(Numeric(12, 3), default=0.000, nullable=False)  # For online orders
    available_stock = Column(Numeric(12, 3), default=0.000, nullable=False)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    product = relationship("Product", back_populates="inventory")
    store = relationship("Store", back_populates="inventory")


class InventoryMovement(Base):
    """
    Immutable stock ledger movement log. Every change is an explicit transaction.
    """
    __tablename__ = "inventory_movements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    store_id = Column(String(36), ForeignKey("stores.id"), nullable=False)
    batch_id = Column(String(36), ForeignKey("batch_lots.id"), nullable=True)

    movement_type = Column(SAEnum(MovementType), nullable=False)
    quantity = Column(Numeric(12, 3), nullable=False)  # Positive (add) or negative (deduct)
    reference_id = Column(String(100), nullable=True)  # Sale ID / Order ID / Purchase ID
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    wastage_reason = Column(SAEnum(WastageReason), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    batch = relationship("BatchLot", back_populates="movements")
