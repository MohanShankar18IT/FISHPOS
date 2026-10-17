import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Numeric, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(100), index=True, nullable=True)
    address = Column(Text, nullable=True)
    loyalty_points = Column(Numeric(10, 0), default=0, nullable=False)
    total_spent = Column(Numeric(12, 2), default=0.00, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    sales = relationship("Sale", back_populates="customer")
    online_orders = relationship("OnlineOrder", back_populates="customer")
