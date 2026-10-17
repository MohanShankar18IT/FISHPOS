import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Company(Base):
    """
    Company Master representing the legal parent organization or enterprise franchise.
    """
    __tablename__ = "companies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(30), unique=True, index=True, nullable=False)
    legal_name = Column(String(150), nullable=False)
    trade_name = Column(String(150), nullable=False)
    cin_number = Column(String(30), nullable=True)
    gstin = Column(String(20), nullable=False)
    pan_number = Column(String(20), nullable=True)
    fssai_central_license = Column(String(30), nullable=True)

    registered_address = Column(Text, nullable=True)
    city = Column(String(100), default="Coimbatore", nullable=False)
    state = Column(String(100), default="Tamil Nadu", nullable=False)
    pincode = Column(String(10), default="641002", nullable=False)
    country = Column(String(50), default="India", nullable=False)

    phone = Column(String(25), nullable=True)
    email = Column(String(100), nullable=True)
    website = Column(String(150), nullable=True)
    currency = Column(String(10), default="INR", nullable=False)
    logo_url = Column(String(255), nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    branches = relationship("Store", back_populates="company", cascade="all, delete-orphan")
