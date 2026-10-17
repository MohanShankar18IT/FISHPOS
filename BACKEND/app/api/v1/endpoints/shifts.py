from datetime import datetime
from decimal import Decimal
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.store import Shift, ShiftStatus
from app.schemas.shift import ShiftOpenRequest, ShiftCloseRequest, ShiftResponse

router = APIRouter(prefix="/shifts", tags=["Register Shifts & Cash Drawer"])


@router.get("/current", response_model=Optional[ShiftResponse])
def get_active_shift(
    store_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shift = db.query(Shift).filter(
        Shift.store_id == store_id,
        Shift.cashier_id == current_user.id,
        Shift.status == ShiftStatus.OPEN
    ).order_by(Shift.opened_at.desc()).first()

    if not shift:
        return None

    resp = ShiftResponse.model_validate(shift)
    resp.cashier_name = current_user.full_name
    return resp


@router.post("/open", response_model=ShiftResponse)
def open_shift(
    req: ShiftOpenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if there is already an open shift for this cashier
    existing = db.query(Shift).filter(
        Shift.store_id == req.store_id,
        Shift.cashier_id == current_user.id,
        Shift.status == ShiftStatus.OPEN
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cashier already has an active open shift on this register."
        )

    shift = Shift(
        store_id=req.store_id,
        cashier_id=current_user.id,
        register_number=req.register_number,
        status=ShiftStatus.OPEN,
        opening_cash=req.opening_cash,
        expected_cash=req.opening_cash,
        notes=req.notes
    )
    db.add(shift)
    db.commit()
    db.refresh(shift)

    resp = ShiftResponse.model_validate(shift)
    resp.cashier_name = current_user.full_name
    return resp


@router.post("/{shift_id}/close", response_model=ShiftResponse)
def close_shift(
    shift_id: str,
    req: ShiftCloseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    if shift.status == ShiftStatus.CLOSED:
        raise HTTPException(status_code=400, detail="Shift is already closed")

    shift.closed_at = datetime.utcnow()
    shift.status = ShiftStatus.CLOSED
    shift.actual_cash = req.actual_cash
    shift.cash_difference = req.actual_cash - shift.expected_cash
    if req.notes:
        shift.notes = (shift.notes or "") + f" | Close Notes: {req.notes}"

    db.commit()
    db.refresh(shift)

    resp = ShiftResponse.model_validate(shift)
    resp.cashier_name = shift.cashier.full_name if shift.cashier else current_user.full_name
    return resp
