import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from app.core.database import Base


class AuditLog(Base):
    """
    Audit trail for critical business actions (price changes, manual stock adjustments, wastage, voided sales).
    """
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    actor_name = Column(String(100), nullable=True)
    action = Column(String(100), nullable=False)  # e.g., "PRICE_UPDATE", "STOCK_ADJUSTMENT", "VOID_SALE"
    entity_type = Column(String(50), nullable=False)  # e.g., "PRODUCT", "SALE", "INVENTORY"
    entity_id = Column(String(50), nullable=False)
    old_state = Column(JSON, nullable=True)
    new_state = Column(JSON, nullable=True)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
