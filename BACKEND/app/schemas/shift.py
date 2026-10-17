from typing import Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.store import ShiftStatus


class ShiftOpenRequest(BaseModel):
    store_id: str
    register_number: str = "REG-01"
    opening_cash: Decimal = Field(..., ge=0, decimal_places=2)
    notes: Optional[str] = None


class ShiftCloseRequest(BaseModel):
    actual_cash: Decimal = Field(..., ge=0, decimal_places=2)
    notes: Optional[str] = None


class ShiftResponse(BaseModel):
    id: str
    store_id: str
    cashier_id: str
    cashier_name: Optional[str] = None
    register_number: str
    status: ShiftStatus
    opened_at: datetime
    closed_at: Optional[datetime] = None
    opening_cash: Decimal
    expected_cash: Decimal
    actual_cash: Optional[Decimal] = None
    cash_difference: Optional[Decimal] = None
    total_sales_amount: Decimal
    cash_sales_amount: Decimal
    card_sales_amount: Decimal
    upi_sales_amount: Decimal
    total_transactions: int
    notes: Optional[str] = None

    class Config:
        from_attributes = True
