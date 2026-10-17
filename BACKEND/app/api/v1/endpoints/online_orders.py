from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.online_order import OnlineOrder, OnlineOrderStatus
from app.schemas.online_order import (
    OnlineOrderCreate,
    OnlineOrderStatusUpdate,
    OnlineOrderResponse
)
from app.services.online_order_service import OnlineOrderService

router = APIRouter(prefix="/online-orders", tags=["Online Orders (Phase 2)"])


@router.get("", response_model=List[OnlineOrderResponse])
def get_online_orders(
    store_id: Optional[str] = None,
    status: Optional[OnlineOrderStatus] = None,
    db: Session = Depends(get_db)
):
    query = db.query(OnlineOrder)
    if store_id:
        query = query.filter(OnlineOrder.store_id == store_id)
    if status:
        query = query.filter(OnlineOrder.status == status)

    orders = query.order_by(OnlineOrder.created_at.desc()).all()
    results = []
    for o in orders:
        resp = OnlineOrderResponse.model_validate(o)
        resp.customer_name = o.customer.name if o.customer else "Online Customer"
        resp.customer_phone = o.customer.phone if o.customer else ""
        results.append(resp)
    return results


@router.post("", response_model=OnlineOrderResponse)
def create_online_order(order_in: OnlineOrderCreate, db: Session = Depends(get_db)):
    service = OnlineOrderService(db)
    order = service.create_online_order(order_in)
    resp = OnlineOrderResponse.model_validate(order)
    resp.customer_name = order_in.customer_name
    resp.customer_phone = order_in.customer_phone
    return resp


@router.patch("/{order_id}/status", response_model=OnlineOrderResponse)
def update_online_order_status(
    order_id: str,
    update: OnlineOrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = OnlineOrderService(db)
    order = service.update_order_status(order_id, update, user_id=current_user.id)
    resp = OnlineOrderResponse.model_validate(order)
    resp.customer_name = order.customer.name if order.customer else "Online Customer"
    resp.customer_phone = order.customer.phone if order.customer else ""
    return resp
