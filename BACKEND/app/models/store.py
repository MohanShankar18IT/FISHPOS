import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class ShiftStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"


class BranchType(str, enum.Enum):
    RETAIL_STORE = "RETAIL_STORE"
    CENTRAL_COLD_HUB = "CENTRAL_COLD_HUB"
    DARK_STORE_FULFILLMENT = "DARK_STORE_FULFILLMENT"
    HARBOR_WHARF = "HARBOR_WHARF"


class Store(Base):
    """
    Branch / Store Master linked to parent Company entity.
    """
    __tablename__ = "stores"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=True)
    code = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    branch_type = Column(SAEnum(BranchType), default=BranchType.RETAIL_STORE, nullable=False)

    address = Column(Text, nullable=True)
    city = Column(String(100), default="Coimbatore", nullable=False)
    state = Column(String(100), default="Tamil Nadu", nullable=False)
    pincode = Column(String(10), default="641002", nullable=False)

    gstin = Column(String(20), nullable=True)
    fssai_state_license = Column(String(30), nullable=True)
    contact_person = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)

    num_registers = Column(Numeric(4, 0), default=2, nullable=False)
    chiller_capacity_kg = Column(Numeric(10, 3), default=500.000, nullable=False)
    scale_ip = Column(String(50), default="192.168.1.120", nullable=True)
    scale_port = Column(Numeric(6, 0), default=9100, nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    company = relationship("Company", back_populates="branches")
    shifts = relationship("Shift", back_populates="store")
    inventory = relationship("Inventory", back_populates="store")
    sales = relationship("Sale", back_populates="store")


class Shift(Base):
    """
    Tracks daily cash drawer opening float, real-time collection, and close counts.
    """
    __tablename__ = "shifts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    store_id = Column(String(36), ForeignKey("stores.id"), nullable=False)
    cashier_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    register_number = Column(String(20), default="REG-01", nullable=False)
    status = Column(SAEnum(ShiftStatus), default=ShiftStatus.OPEN, nullable=False)

    opened_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    closed_at = Column(DateTime, nullable=True)

    opening_cash = Column(Numeric(12, 2), default=0.00, nullable=False)
    expected_cash = Column(Numeric(12, 2), default=0.00, nullable=False)
    actual_cash = Column(Numeric(12, 2), nullable=True)
    cash_difference = Column(Numeric(12, 2), nullable=True)  # Over / Short

    total_sales_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    cash_sales_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    card_sales_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    upi_sales_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    total_transactions = Column(Numeric(10, 0), default=0, nullable=False)

    notes = Column(Text, nullable=True)

    # Relationships
    store = relationship("Store", back_populates="shifts")
    cashier = relationship("User", back_populates="shifts")
    sales = relationship("Sale", back_populates="shift")
