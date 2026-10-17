from decimal import Decimal
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.inventory import Inventory, InventoryMovement, BatchLot, MovementType, WastageReason
from app.models.product import Product
from app.schemas.inventory import BatchLotCreate, WastageCreate


class InventoryService:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_inventory(self, product_id: str, store_id: str) -> Inventory:
        inv = self.db.query(Inventory).filter(
            Inventory.product_id == product_id,
            Inventory.store_id == store_id
        ).first()

        if not inv:
            inv = Inventory(
                product_id=product_id,
                store_id=store_id,
                physical_stock=Decimal("0.000"),
                reserved_stock=Decimal("0.000"),
                available_stock=Decimal("0.000")
            )
            self.db.add(inv)
            self.db.flush()
        return inv

    def record_movement(
        self,
        product_id: str,
        store_id: str,
        movement_type: MovementType,
        quantity: Decimal,
        reference_id: Optional[str] = None,
        user_id: Optional[str] = None,
        batch_id: Optional[str] = None,
        wastage_reason: Optional[WastageReason] = None,
        notes: Optional[str] = None
    ) -> InventoryMovement:
        """
        Authoritatively records an immutable stock ledger entry and updates balance atomically.
        """
        inv = self.get_or_create_inventory(product_id, store_id)

        # Update balance depending on movement type
        if movement_type in [MovementType.PURCHASE, MovementType.OPENING, MovementType.TRANSFER_IN, MovementType.SALE_RETURN]:
            inv.physical_stock += quantity
        elif movement_type in [MovementType.SALE, MovementType.PURCHASE_RETURN, MovementType.TRANSFER_OUT, MovementType.WASTAGE]:
            if inv.physical_stock < quantity:
                product = self.db.query(Product).filter(Product.id == product_id).first()
                p_name = product.name if product else product_id
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient physical stock for '{p_name}'. Available: {inv.physical_stock} kg, Required: {quantity} kg"
                )
            inv.physical_stock -= quantity
        elif movement_type == MovementType.RESERVATION:
            if inv.available_stock < quantity:
                product = self.db.query(Product).filter(Product.id == product_id).first()
                p_name = product.name if product else product_id
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock to reserve for '{p_name}'. Available: {inv.available_stock} kg, Required: {quantity} kg"
                )
            inv.reserved_stock += quantity
        elif movement_type == MovementType.RELEASE:
            inv.reserved_stock = max(Decimal("0.000"), inv.reserved_stock - quantity)
        elif movement_type == MovementType.ADJUSTMENT:
            inv.physical_stock += quantity  # Quantity can be positive or negative

        # Maintain invariant: available = physical - reserved
        inv.available_stock = max(Decimal("0.000"), inv.physical_stock - inv.reserved_stock)

        movement = InventoryMovement(
            product_id=product_id,
            store_id=store_id,
            batch_id=batch_id,
            movement_type=movement_type,
            quantity=quantity,
            reference_id=reference_id,
            user_id=user_id,
            wastage_reason=wastage_reason,
            notes=notes
        )
        self.db.add(movement)
        return movement

    def receive_fresh_batch(self, batch_data: BatchLotCreate, store_id: str, user_id: str) -> BatchLot:
        """
        Receives fresh catch lot and credits physical inventory ledger with MovementType.PURCHASE.
        """
        batch = BatchLot(
            lot_number=batch_data.lot_number,
            product_id=batch_data.product_id,
            supplier_name=batch_data.supplier_name,
            landing_port=batch_data.landing_port,
            received_weight_kg=batch_data.received_weight_kg,
            cost_per_kg=batch_data.cost_per_kg,
            expiry_date=batch_data.expiry_date
        )
        self.db.add(batch)
        self.db.flush()

        self.record_movement(
            product_id=batch_data.product_id,
            store_id=store_id,
            movement_type=MovementType.PURCHASE,
            quantity=batch_data.received_weight_kg,
            batch_id=batch.id,
            reference_id=batch.lot_number,
            user_id=user_id,
            notes=f"Fresh Catch Arrival from {batch_data.landing_port or batch_data.supplier_name or 'Supplier'}"
        )
        return batch

    def record_wastage(self, data: WastageCreate, user_id: str) -> InventoryMovement:
        """
        Records wastage (cutting loss, spoilage) with mandatory reason.
        """
        return self.record_movement(
            product_id=data.product_id,
            store_id=data.store_id,
            movement_type=MovementType.WASTAGE,
            quantity=data.quantity,
            wastage_reason=data.reason,
            user_id=user_id,
            notes=data.notes or f"Wastage: {data.reason.value}"
        )
