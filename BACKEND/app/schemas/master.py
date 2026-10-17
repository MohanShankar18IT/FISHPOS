from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CompanyBase(BaseModel):
    code: str
    legal_name: str
    trade_name: str
    cin_number: Optional[str] = None
    gstin: str
    pan_number: Optional[str] = None
    fssai_central_license: Optional[str] = None
    registered_address: Optional[str] = None
    city: str = "Coimbatore"
    state: str = "Tamil Nadu"
    pincode: str = "641002"
    country: str = "India"
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    currency: str = "INR"
    logo_url: Optional[str] = None
    is_active: bool = True


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    legal_name: Optional[str] = None
    trade_name: Optional[str] = None
    cin_number: Optional[str] = None
    gstin: Optional[str] = None
    pan_number: Optional[str] = None
    fssai_central_license: Optional[str] = None
    registered_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    is_active: Optional[bool] = None


class CompanyResponse(CompanyBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BranchBase(BaseModel):
    company_id: Optional[str] = None
    code: str
    name: str
    branch_type: str = "RETAIL_STORE"
    address: Optional[str] = None
    city: str = "Coimbatore"
    state: str = "Tamil Nadu"
    pincode: str = "641002"
    gstin: Optional[str] = None
    fssai_state_license: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    num_registers: int = 2
    chiller_capacity_kg: float = 500.0
    scale_ip: Optional[str] = "192.168.1.120"
    scale_port: Optional[int] = 9100
    is_active: bool = True


class BranchCreate(BranchBase):
    pass


class BranchUpdate(BaseModel):
    name: Optional[str] = None
    branch_type: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    gstin: Optional[str] = None
    fssai_state_license: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    num_registers: Optional[int] = None
    chiller_capacity_kg: Optional[float] = None
    scale_ip: Optional[str] = None
    scale_port: Optional[int] = None
    is_active: Optional[bool] = None


class BranchResponse(BranchBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
