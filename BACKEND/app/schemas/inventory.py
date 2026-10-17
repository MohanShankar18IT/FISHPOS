from typing import Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.inventory import MovementType, WastageReason


class BatchLotCreate(BaseModel):
    lot_number: str
    product_id: str
    supplier_name: Optional[str] = None
    landing_port: Optional[str] = None
    received_weight_kg: Decimal = Field(..., gt=0, decimal_places=3)
    cost_per_kg: Decimal = Field(..., gt=0, decimal_places=2)
    expiry_date: Optional[datetime] = None


class BatchLotResponse(BaseModel):
    id: str
    lot_number: str
    product_id: str
    supplier_name: Optional[str] = None
    landing_port: Optional[str] = None
    received_weight_kg: Decimal
    cost_per_kg: Decimal
    received_at: datetime
    expiry_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class InventoryMovementCreate(BaseModel):
    product_id: str
    store_id: str
    movement_type: MovementType
    quantity: Decimal = Field(..., decimal_places=3)
    batch_id: Optional[str] = None
    reference_id: Optional[str] = None
    wastage_reason: Optional[WastageReason] = None
    notes: Optional[str] = None


class WastageCreate(BaseModel):
    product_id: str
    store_id: str
    quantity: Decimal = Field(..., gt=0, decimal_places=3)
    reason: WastageReason
    notes: Optional[str] = None


class InventoryResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    store_id: str
    physical_stock: Decimal
    reserved_stock: Decimal
    available_stock: Decimal
    updated_at: datetime

    class Config:
        from_attributes = True
