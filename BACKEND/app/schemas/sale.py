from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.sale import SaleStatus, PaymentMethod, PaymentStatus


class SaleItemCreate(BaseModel):
    product_id: str
    cut_type: str = "Whole"
    weight_kg: Decimal = Field(..., gt=0, decimal_places=3)
    discount_amount: Decimal = Field(default=Decimal("0.00"), ge=0, decimal_places=2)


class PaymentCreate(BaseModel):
    payment_method: PaymentMethod
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    tendered_amount: Optional[Decimal] = None
    transaction_ref: Optional[str] = None


class CustomerCreateInline(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None


class SaleCreateRequest(BaseModel):
    store_id: str
    shift_id: str
    customer: Optional[CustomerCreateInline] = None
    items: List[SaleItemCreate] = Field(..., min_length=1)
    overall_discount: Decimal = Field(default=Decimal("0.00"), ge=0, decimal_places=2)
    payments: List[PaymentCreate] = Field(default_factory=list)
    notes: Optional[str] = None


class HoldSaleRequest(BaseModel):
    store_id: str
    shift_id: str
    customer_name: Optional[str] = "Walk-in Guest"
    items: List[SaleItemCreate] = Field(..., min_length=1)
    notes: Optional[str] = None


class SaleItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    cut_type: str
    weight_kg: Decimal
    unit_price: Decimal
    discount_amount: Decimal
    tax_rate: Decimal
    tax_amount: Decimal
    subtotal: Decimal

    class Config:
        from_attributes = True


class PaymentResponse(BaseModel):
    id: str
    payment_method: PaymentMethod
    status: PaymentStatus
    amount: Decimal
    tendered_amount: Optional[Decimal] = None
    change_due: Optional[Decimal] = None
    transaction_ref: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SaleResponse(BaseModel):
    id: str
    sale_number: str
    store_id: str
    shift_id: str
    cashier_id: str
    cashier_name: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    status: SaleStatus
    subtotal: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    round_off: Decimal
    grand_total: Decimal
    items: List[SaleItemResponse]
    payments: List[PaymentResponse]
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
