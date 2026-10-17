from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.product import UnitType


class CategoryBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    icon: Optional[str] = "Fish"
    display_order: int = 0
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class CategoryResponse(CategoryBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    sku: str
    barcode: Optional[str] = None
    name: str
    local_name: Optional[str] = None
    scientific_name: Optional[str] = None
    category_id: str
    unit_type: UnitType = UnitType.KG
    selling_price: Decimal = Field(..., ge=0, decimal_places=2)
    cost_price: Decimal = Field(default=Decimal("0.00"), ge=0, decimal_places=2)
    tax_rate: Decimal = Field(default=Decimal("5.00"), ge=0, decimal_places=2)
    cut_options: List[str] = Field(default_factory=lambda: ["Whole", "Curry Cut", "Steaks", "Fillet", "Cleaned"])
    min_stock_alert: Decimal = Field(default=Decimal("5.000"), ge=0, decimal_places=3)
    is_online_listed: bool = True
    image_url: Optional[str] = None
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    local_name: Optional[str] = None
    scientific_name: Optional[str] = None
    barcode: Optional[str] = None
    category_id: Optional[str] = None
    unit_type: Optional[UnitType] = None
    selling_price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    tax_rate: Optional[Decimal] = None
    cut_options: Optional[List[str]] = None
    min_stock_alert: Optional[Decimal] = None
    is_online_listed: Optional[bool] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class PriceUpdateSchema(BaseModel):
    new_selling_price: Decimal = Field(..., gt=0, decimal_places=2)
    reason: Optional[str] = None


class BulkPriceUpdateItem(BaseModel):
    product_id: str
    new_selling_price: Decimal = Field(..., gt=0, decimal_places=2)


class BulkPriceUpdateRequest(BaseModel):
    items: List[BulkPriceUpdateItem]
    reason: Optional[str] = "Bulk Morning Landing Rate Update"


class ProductPriceHistoryResponse(BaseModel):
    id: str
    product_id: str
    old_selling_price: Decimal
    new_selling_price: Decimal
    changed_by: Optional[str] = None
    changed_at: datetime
    reason: Optional[str] = None

    class Config:
        from_attributes = True


class ProductResponse(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime
    category_name: Optional[str] = None
    current_stock: Optional[Decimal] = Decimal("0.000")

    class Config:
        from_attributes = True
