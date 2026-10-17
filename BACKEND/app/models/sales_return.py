import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class ReturnReason(str, enum.Enum):
    QUALITY_DEFECT = "QUALITY_DEFECT"
    WRONG_CUT = "WRONG_CUT"
    OVERCHARGED = "OVERCHARGED"
    CUSTOMER_CHANGED_MIND = "CUSTOMER_CHANGED_MIND"
    SPOILED_ON_ARRIVAL = "SPOILED_ON_ARRIVAL"


class SalesReturn(Base):
    """
    Sales Return transaction header.
    """
    __tablename__ = "sales_returns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    return_number = Column(String(50), unique=True, index=True, nullable=False)
    sale_id = Column(String(36), ForeignKey("sales.id"), nullable=False)
    store_id = Column(String(36), ForeignKey("stores.id"), nullable=False)
    processed_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=True)

    refund_method = Column(String(50), default="CASH", nullable=False)  # CASH, UPI, STORE_CREDIT
    refund_amount = Column(Numeric(12, 2), nullable=False)
    reason = Column(SAEnum(ReturnReason), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    items = relationship("SalesReturnItem", back_populates="sales_return", cascade="all, delete-orphan")


class SalesReturnItem(Base):
    """
    Line item for returned fish stock.
    """
    __tablename__ = "sales_return_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    return_id = Column(String(36), ForeignKey("sales_returns.id"), nullable=False)
    sale_item_id = Column(String(36), ForeignKey("sale_items.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)

    return_weight_kg = Column(Numeric(12, 3), nullable=False)
    refund_amount = Column(Numeric(12, 2), nullable=False)
    return_reason = Column(SAEnum(ReturnReason), nullable=False)
    is_restocked = Column(Numeric(1, 0), default=0, nullable=False)  # 1 if restocked to inventory, 0 if written off as wastage

    # Relationships
    sales_return = relationship("SalesReturn", back_populates="items")
