from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.sale import Sale, SaleStatus
from app.schemas.sale import SaleCreateRequest, HoldSaleRequest, SaleResponse
from app.services.sale_service import SaleService

router = APIRouter(prefix="/sales", tags=["Sales & POS"])


@router.post("", response_model=SaleResponse)
def checkout_sale(
    sale_req: SaleCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SaleService(db)
    sale = service.checkout_sale(sale_req, cashier_id=current_user.id)
    
    # Format response
    resp = SaleResponse.model_validate(sale)
    resp.cashier_name = sale.cashier.full_name if sale.cashier else current_user.full_name
    if sale.customer:
        resp.customer_name = sale.customer.name
        resp.customer_phone = sale.customer.phone
    return resp


@router.post("/hold", response_model=SaleResponse)
def hold_sale(
    hold_req: HoldSaleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SaleService(db)
    sale = service.hold_sale(hold_req, cashier_id=current_user.id)
    resp = SaleResponse.model_validate(sale)
    resp.cashier_name = current_user.full_name
    return resp


@router.get("/held/active", response_model=List[SaleResponse])
def get_held_sales(store_id: str, db: Session = Depends(get_db)):
    held_sales = db.query(Sale).filter(
        Sale.store_id == store_id,
        Sale.status == SaleStatus.HELD
    ).order_by(Sale.created_at.desc()).all()
    return held_sales


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale_by_id(sale_id: str, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    resp = SaleResponse.model_validate(sale)
    resp.cashier_name = sale.cashier.full_name if sale.cashier else None
    if sale.customer:
        resp.customer_name = sale.customer.name
        resp.customer_phone = sale.customer.phone
    return resp


@router.get("", response_model=List[SaleResponse])
def list_sales(
    store_id: Optional[str] = None,
    shift_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Sale)
    if store_id:
        query = query.filter(Sale.store_id == store_id)
    if shift_id:
        query = query.filter(Sale.shift_id == shift_id)
    
    sales = query.order_by(Sale.created_at.desc()).limit(limit).all()
    return sales
