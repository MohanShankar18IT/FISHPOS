from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.inventory import Inventory, InventoryMovement, BatchLot
from app.schemas.inventory import (
    BatchLotCreate,
    BatchLotResponse,
    InventoryResponse,
    WastageCreate
)
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/inventory", tags=["Inventory & Batches"])


@router.get("", response_model=List[InventoryResponse])
def get_inventory_stock(store_id: str, db: Session = Depends(get_db)):
    stocks = db.query(Inventory).filter(Inventory.store_id == store_id).all()
    results = []
    for s in stocks:
        resp = InventoryResponse(
            id=s.id,
            product_id=s.product_id,
            product_name=s.product.name if s.product else "Unknown Fish",
            store_id=s.store_id,
            physical_stock=s.physical_stock,
            reserved_stock=s.reserved_stock,
            available_stock=s.available_stock,
            updated_at=s.updated_at
        )
        results.append(resp)
    return results


@router.post("/batches", response_model=BatchLotResponse)
def receive_fresh_batch(
    batch_in: BatchLotCreate,
    store_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = InventoryService(db)
    batch = service.receive_fresh_batch(batch_in, store_id=store_id, user_id=current_user.id)
    db.commit()
    db.refresh(batch)
    return batch


@router.post("/wastage")
def record_wastage(
    wastage_in: WastageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = InventoryService(db)
    service.record_wastage(wastage_in, user_id=current_user.id)
    db.commit()
    return {"message": "Wastage recorded successfully and stock updated"}
