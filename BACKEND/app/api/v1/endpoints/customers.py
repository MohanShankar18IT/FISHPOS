import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.customer import Customer
from app.models.online_order import OnlineOrder

router = APIRouter(prefix="/customers", tags=["Customers & Mobile Auth"])


class CustomerRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=8, max_length=20)
    email: Optional[str] = None
    address: Optional[str] = None


class CustomerPhoneLoginRequest(BaseModel):
    phone: str = Field(..., min_length=8, max_length=20)


class CustomerResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    loyalty_points: float
    total_spent: float
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/register", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def register_customer(req: CustomerRegisterRequest, db: Session = Depends(get_db)):
    """
    Registers a new customer using mobile number as primary identifier.
    If already exists, updates name and address and returns existing customer.
    """
    clean_phone = req.phone.strip().replace(" ", "").replace("-", "")
    customer = db.query(Customer).filter(Customer.phone == clean_phone).first()

    if customer:
        # Update existing profile
        customer.name = req.name.strip()
        if req.address:
            customer.address = req.address.strip()
        if req.email:
            customer.email = req.email.strip()
        db.commit()
        db.refresh(customer)
        return customer

    new_customer = Customer(
        id=str(uuid.uuid4()),
        name=req.name.strip(),
        phone=clean_phone,
        email=req.email.strip() if req.email else None,
        address=req.address.strip() if req.address else None,
        loyalty_points=Decimal("50"), # 50 Welcome bonus loyalty points
        total_spent=Decimal("0.00")
    )
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer


@router.post("/login-phone", response_model=CustomerResponse)
def login_with_phone(req: CustomerPhoneLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates/retrieves a customer profile by registered mobile number.
    """
    clean_phone = req.phone.strip().replace(" ", "").replace("-", "")
    customer = db.query(Customer).filter(Customer.phone == clean_phone).first()

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mobile number not registered. Please register your account."
        )

    return customer


@router.get("/by-phone/{phone}", response_model=CustomerResponse)
def get_customer_by_phone(phone: str, db: Session = Depends(get_db)):
    clean_phone = phone.strip().replace(" ", "").replace("-", "")
    customer = db.query(Customer).filter(Customer.phone == clean_phone).first()

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with phone {phone} not found."
        )

    return customer


@router.get("", response_model=List[CustomerResponse])
def list_customers(search: Optional[str] = None, limit: int = 50, db: Session = Depends(get_db)):
    query = db.query(Customer)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((Customer.name.ilike(s)) | (Customer.phone.ilike(s)))
    return query.order_by(Customer.created_at.desc()).limit(limit).all()
