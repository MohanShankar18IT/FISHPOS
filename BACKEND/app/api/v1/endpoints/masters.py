from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.company import Company
from app.models.store import Store, BranchType
from app.schemas.master import (
    CompanyCreate,
    CompanyUpdate,
    CompanyResponse,
    BranchCreate,
    BranchUpdate,
    BranchResponse
)

router = APIRouter()


# -----------------------------------------------------------------------------
# COMPANY MASTER ENDPOINTS
# -----------------------------------------------------------------------------

@router.get("/companies", response_model=List[CompanyResponse])
def list_companies(
    db: Session = Depends(get_db),
    is_active: Optional[bool] = None
):
    query = db.query(Company)
    if is_active is not None:
        query = query.filter(Company.is_active == is_active)
    return query.order_by(Company.created_at.desc()).all()


@router.post("/companies", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
def create_company(
    company_in: CompanyCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(Company).filter(Company.code == company_in.code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Company with code '{company_in.code}' already exists")

    company = Company(
        code=company_in.code.upper(),
        legal_name=company_in.legal_name,
        trade_name=company_in.trade_name,
        cin_number=company_in.cin_number,
        gstin=company_in.gstin,
        pan_number=company_in.pan_number,
        fssai_central_license=company_in.fssai_central_license,
        registered_address=company_in.registered_address,
        city=company_in.city,
        state=company_in.state,
        pincode=company_in.pincode,
        country=company_in.country,
        phone=company_in.phone,
        email=company_in.email,
        website=company_in.website,
        currency=company_in.currency,
        logo_url=company_in.logo_url,
        is_active=company_in.is_active
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@router.get("/companies/{company_id}", response_model=CompanyResponse)
def get_company(
    company_id: str,
    db: Session = Depends(get_db)
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.put("/companies/{company_id}", response_model=CompanyResponse)
def update_company(
    company_id: str,
    update_in: CompanyUpdate,
    db: Session = Depends(get_db)
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    update_data = update_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)

    db.commit()
    db.refresh(company)
    return company


# -----------------------------------------------------------------------------
# BRANCH MASTER ENDPOINTS
# -----------------------------------------------------------------------------

@router.get("/branches", response_model=List[BranchResponse])
def list_branches(
    db: Session = Depends(get_db),
    company_id: Optional[str] = None,
    is_active: Optional[bool] = None
):
    query = db.query(Store)
    if company_id:
        query = query.filter(Store.company_id == company_id)
    if is_active is not None:
        query = query.filter(Store.is_active == is_active)
    return query.order_by(Store.code.asc()).all()


@router.post("/branches", response_model=BranchResponse, status_code=status.HTTP_201_CREATED)
def create_branch(
    branch_in: BranchCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(Store).filter(Store.code == branch_in.code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Branch with code '{branch_in.code}' already exists")

    branch = Store(
        company_id=branch_in.company_id,
        code=branch_in.code.upper(),
        name=branch_in.name,
        branch_type=branch_in.branch_type,
        address=branch_in.address,
        city=branch_in.city,
        state=branch_in.state,
        pincode=branch_in.pincode,
        gstin=branch_in.gstin,
        fssai_state_license=branch_in.fssai_state_license,
        contact_person=branch_in.contact_person,
        phone=branch_in.phone,
        email=branch_in.email,
        num_registers=branch_in.num_registers,
        chiller_capacity_kg=branch_in.chiller_capacity_kg,
        scale_ip=branch_in.scale_ip,
        scale_port=branch_in.scale_port,
        is_active=branch_in.is_active
    )
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch


@router.get("/branches/{branch_id}", response_model=BranchResponse)
def get_branch(
    branch_id: str,
    db: Session = Depends(get_db)
):
    branch = db.query(Store).filter(Store.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    return branch


@router.put("/branches/{branch_id}", response_model=BranchResponse)
def update_branch(
    branch_id: str,
    update_in: BranchUpdate,
    db: Session = Depends(get_db)
):
    branch = db.query(Store).filter(Store.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    update_data = update_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(branch, field, value)

    db.commit()
    db.refresh(branch)
    return branch
