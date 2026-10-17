import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.online_order import OnlineOrder, OnlineOrderItem, StockReservation, OnlineOrderStatus
from app.models.product import Product
from app.models.customer import Customer
from app.models.inventory import MovementType
from app.schemas.online_order import OnlineOrderCreate, OnlineOrderStatusUpdate
from app.services.inventory_service import InventoryService


class OnlineOrderService:
    def __init__(self, db: Session):
        self.db = db
        self.inventory_service = InventoryService(db)

    def create_online_order(self, req: OnlineOrderCreate) -> OnlineOrder:
        """
        Creates an online order and locks stock by creating a stock reservation.
        """
        # Resolve customer
        customer = None
        if req.customer_id:
            customer = self.db.query(Customer).filter(Customer.id == req.customer_id).first()
        if not customer and req.customer_phone:
            customer = self.db.query(Customer).filter(Customer.phone == req.customer_phone).first()
            if not customer:
                customer = Customer(
                    name=req.customer_name,
                    phone=req.customer_phone,
                    address=req.delivery_address
                )
                self.db.add(customer)
                self.db.flush()

        order_number = f"ORD-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"

        order = OnlineOrder(
            order_number=order_number,
            customer_id=customer.id if customer else "walkin-customer-id",
            store_id=req.store_id,
            status=OnlineOrderStatus.PENDING,
            delivery_type=req.delivery_type,
            delivery_address=req.delivery_address,
            delivery_slot=req.delivery_slot,
            special_instructions=req.special_instructions,
            subtotal=Decimal("0.00"),
            delivery_fee=Decimal("40.00"),  # Standard nominal delivery
            discount_amount=Decimal("0.00"),
            tax_amount=Decimal("0.00"),
            grand_total=Decimal("0.00")
        )
        self.db.add(order)
        self.db.flush()

        item_subtotals = []
        item_entities = []

        for item_req in req.items:
            product = self.db.query(Product).filter(Product.id == item_req.product_id).first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {item_req.product_id} not found"
                )

            item_subtotal = (item_req.requested_weight_kg * product.selling_price).quantize(Decimal("0.01"))
            order_item = OnlineOrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                cut_type=item_req.cut_type,
                requested_weight_kg=item_req.requested_weight_kg,
                unit_price=product.selling_price,
                subtotal=item_subtotal
            )
            item_entities.append(order_item)
            item_subtotals.append(item_subtotal)

            # Reserve Inventory
            self.inventory_service.record_movement(
                product_id=product.id,
                store_id=req.store_id,
                movement_type=MovementType.RESERVATION,
                quantity=item_req.requested_weight_kg,
                reference_id=order.order_number,
                notes=f"Stock Reserved for Online Order {order.order_number}"
            )

            reservation = StockReservation(
                order_id=order.id,
                product_id=product.id,
                store_id=req.store_id,
                reserved_weight_kg=item_req.requested_weight_kg
            )
            self.db.add(reservation)

        order.subtotal = sum(item_subtotals)
        order.tax_amount = (order.subtotal * Decimal("0.05")).quantize(Decimal("0.01"))
        order.grand_total = order.subtotal + order.delivery_fee + order.tax_amount
        order.items = item_entities

        self.db.commit()
        self.db.refresh(order)
        return order

    def update_order_status(self, order_id: str, update: OnlineOrderStatusUpdate, user_id: str) -> OnlineOrder:
        """
        Manages valid state transitions:
        - On DELIVERED: Deduct physical stock and clear reservation.
        - On CANCELLED: Release reservation back to available stock.
        """
        order = self.db.query(OnlineOrder).filter(OnlineOrder.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        prev_status = order.status
        new_status = update.status

        if prev_status == new_status:
            return order

        # Handle terminal transitions
        if new_status == OnlineOrderStatus.DELIVERED and prev_status != OnlineOrderStatus.DELIVERED:
            for item in order.items:
                # Deduct physical stock
                self.inventory_service.record_movement(
                    product_id=item.product_id,
                    store_id=order.store_id,
                    movement_type=MovementType.SALE,
                    quantity=item.requested_weight_kg,
                    reference_id=order.order_number,
                    user_id=user_id,
                    notes=f"Online Order Delivered: {order.order_number}"
                )
                # Clear reservation
                self.inventory_service.record_movement(
                    product_id=item.product_id,
                    store_id=order.store_id,
                    movement_type=MovementType.RELEASE,
                    quantity=item.requested_weight_kg,
                    reference_id=order.order_number,
                    user_id=user_id,
                    notes=f"Online Order Reservation Cleared: {order.order_number}"
                )
        elif new_status == OnlineOrderStatus.CANCELLED and prev_status != OnlineOrderStatus.CANCELLED:
            for item in order.items:
                # Release reserved stock back to available pool
                self.inventory_service.record_movement(
                    product_id=item.product_id,
                    store_id=order.store_id,
                    movement_type=MovementType.RELEASE,
                    quantity=item.requested_weight_kg,
                    reference_id=order.order_number,
                    user_id=user_id,
                    notes=f"Online Order Cancelled, Released Stock: {order.order_number}"
                )

        order.status = new_status
        order.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(order)
        return order
