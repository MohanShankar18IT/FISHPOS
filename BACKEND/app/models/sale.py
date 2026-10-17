import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class SaleStatus(str, enum.Enum):
    COMPLETED = "COMPLETED"
    HELD = "HELD"
    VOIDED = "VOIDED"
    REFUNDED = "REFUNDED"


class PaymentMethod(str, enum.Enum):
    CASH = "CASH"
    CARD = "CARD"
    UPI = "UPI"
    SPLIT = "SPLIT"


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class Sale(Base):
    """
    Retail Counter POS Sale transaction record.
    """
    __tablename__ = "sales"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sale_number = Column(String(50), unique=True, index=True, nullable=False)
    store_id = Column(String(36), ForeignKey("stores.id"), nullable=False)
    shift_id = Column(String(36), ForeignKey("shifts.id"), nullable=False)
    cashier_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=True)

    status = Column(SAEnum(SaleStatus), default=SaleStatus.COMPLETED, nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)
    discount_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    tax_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    round_off = Column(Numeric(5, 2), default=0.00, nullable=False)
    grand_total = Column(Numeric(12, 2), nullable=False)

    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    store = relationship("Store", back_populates="sales")
    shift = relationship("Shift", back_populates="sales")
    cashier = relationship("User", back_populates="sales")
    customer = relationship("Customer", back_populates="sales")
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="sale", cascade="all, delete-orphan")


class SaleItem(Base):
    """
    Individual fish line item in a sale with cut customization and weight.
    """
    __tablename__ = "sale_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sale_id = Column(String(36), ForeignKey("sales.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)

    product_name = Column(String(150), nullable=False)
    cut_type = Column(String(50), default="Whole", nullable=False)  # e.g., Curry Cut, Steaks
    weight_kg = Column(Numeric(12, 3), nullable=False)  # Weight in KG or Pieces
    unit_price = Column(Numeric(12, 2), nullable=False)  # Price charged at time of sale
    discount_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    tax_rate = Column(Numeric(5, 2), default=5.00, nullable=False)
    tax_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)  # (weight * price) - discount + tax

    # Relationships
    sale = relationship("Sale", back_populates="items")
    product = relationship("Product", back_populates="sale_items")


class Payment(Base):
    """
    Payment settlement details for a sale.
    """
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sale_id = Column(String(36), ForeignKey("sales.id"), nullable=True)
    payment_method = Column(SAEnum(PaymentMethod), nullable=False)
    status = Column(SAEnum(PaymentStatus), default=PaymentStatus.PAID, nullable=False)

    amount = Column(Numeric(12, 2), nullable=False)
    tendered_amount = Column(Numeric(12, 2), nullable=True)  # For Cash (e.g. gave ₹1000 for ₹850)
    change_due = Column(Numeric(12, 2), default=0.00, nullable=True)
    transaction_ref = Column(String(100), nullable=True)  # UPI UTR / Card Auth Code

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    sale = relationship("Sale", back_populates="payments")
