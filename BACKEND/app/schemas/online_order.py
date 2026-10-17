from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.online_order import OnlineOrderStatus, DeliveryType


class OnlineOrderItemCreate(BaseModel):
    product_id: str
    cut_type: str = "Curry Cut"
    requested_weight_kg: Decimal = Field(..., gt=0, decimal_places=3)


class OnlineOrderCreate(BaseModel):
    store_id: str
    customer_id: Optional[str] = None
    customer_name: str
    customer_phone: str
    delivery_type: DeliveryType = DeliveryType.HOME_DELIVERY
    delivery_address: Optional[str] = None
    delivery_slot: Optional[str] = None
    special_instructions: Optional[str] = None
    items: List[OnlineOrderItemCreate] = Field(..., min_length=1)


class OnlineOrderStatusUpdate(BaseModel):
    status: OnlineOrderStatus
    notes: Optional[str] = None


class OnlineOrderItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    cut_type: str
    requested_weight_kg: Decimal
    actual_weight_kg: Optional[Decimal] = None
    unit_price: Decimal
    subtotal: Decimal

    class Config:
        from_attributes = True


class OnlineOrderResponse(BaseModel):
    id: str
    order_number: str
    store_id: str
    customer_id: str
    customer_name: str
    customer_phone: str
    status: OnlineOrderStatus
    delivery_type: DeliveryType
    delivery_address: Optional[str] = None
    delivery_slot: Optional[str] = None
    special_instructions: Optional[str] = None
    subtotal: Decimal
    delivery_fee: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    grand_total: Decimal
    is_paid: bool
    items: List[OnlineOrderItemResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
