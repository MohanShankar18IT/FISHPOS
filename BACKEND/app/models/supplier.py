import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class PurchaseStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    RECEIVED = "RECEIVED"
    CANCELLED = "CANCELLED"


class Supplier(Base):
    """
    Seafood supplier / boat harbor vendor master record.
    """
    __tablename__ = "suppliers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    contact_person = Column(String(100), nullable=True)
    phone = Column(String(20), index=True, nullable=False)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    gst_number = Column(String(50), nullable=True)
    payment_terms = Column(String(100), default="Immediate / Cash", nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    purchases = relationship("Purchase", back_populates="supplier")


class Purchase(Base):
    """
    Purchase Order & Goods Receipt from fish suppliers/boat landings.
    """
    __tablename__ = "purchases"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    purchase_number = Column(String(50), unique=True, index=True, nullable=False)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False)
    store_id = Column(String(36), ForeignKey("stores.id"), nullable=False)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)

    purchase_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(SAEnum(PurchaseStatus), default=PurchaseStatus.RECEIVED, nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)
    tax_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)
    payment_status = Column(String(50), default="PAID", nullable=False)  # PAID, PENDING, PARTIAL
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    supplier = relationship("Supplier", back_populates="purchases")
    items = relationship("PurchaseItem", back_populates="purchase", cascade="all, delete-orphan")


class PurchaseItem(Base):
    """
    Line item in a seafood purchase lot with weight and cost per kg.
    """
    __tablename__ = "purchase_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    purchase_id = Column(String(36), ForeignKey("purchases.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    batch_lot_id = Column(String(36), ForeignKey("batch_lots.id"), nullable=True)

    quantity_kg = Column(Numeric(12, 3), nullable=False)
    cost_per_kg = Column(Numeric(12, 2), nullable=False)
    tax_rate = Column(Numeric(5, 2), default=0.00, nullable=False)
    tax_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)

    # Relationships
    purchase = relationship("Purchase", back_populates="items")
