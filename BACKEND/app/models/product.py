import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, ForeignKey, Enum as SAEnum, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class UnitType(str, enum.Enum):
    KG = "KG"
    GRAMS = "GRAMS"
    PIECE = "PIECE"
    PACKET = "PACKET"


class Category(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, index=True, nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)  # Icon identifier for POS UI
    display_order = Column(Numeric(5, 0), default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    products = relationship("Product", back_populates="category")


class Product(Base):
    """
    Fish product master record supporting catch weight, cut styles, and pricing.
    """
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sku = Column(String(50), unique=True, index=True, nullable=False)
    barcode = Column(String(50), unique=True, index=True, nullable=True)
    name = Column(String(150), index=True, nullable=False)
    local_name = Column(String(150), nullable=True)  # e.g., Vanjaram / Seer Fish
    scientific_name = Column(String(150), nullable=True)
    category_id = Column(String(36), ForeignKey("categories.id"), nullable=False)

    unit_type = Column(SAEnum(UnitType), default=UnitType.KG, nullable=False)
    selling_price = Column(Numeric(12, 2), nullable=False)  # Price per unit (e.g. ₹/kg)
    cost_price = Column(Numeric(12, 2), default=0.00, nullable=False)
    tax_rate = Column(Numeric(5, 2), default=5.00, nullable=False)  # GST %

    # Available cut options: ["Whole", "Curry Cut", "Steaks", "Fillet", "Cleaned"]
    cut_options = Column(JSON, default=list, nullable=False)
    min_stock_alert = Column(Numeric(12, 3), default=5.000, nullable=False)
    is_online_listed = Column(Boolean, default=True, nullable=False)
    image_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    category = relationship("Category", back_populates="products")
    inventory = relationship("Inventory", back_populates="product")
    sale_items = relationship("SaleItem", back_populates="product")
    price_history = relationship("ProductPriceHistory", back_populates="product")


class ProductPriceHistory(Base):
    """
    Immutable price history audit trail.
    """
    __tablename__ = "product_price_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    old_selling_price = Column(Numeric(12, 2), nullable=False)
    new_selling_price = Column(Numeric(12, 2), nullable=False)
    changed_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    changed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    reason = Column(String(255), nullable=True)

    # Relationships
    product = relationship("Product", back_populates="price_history")
