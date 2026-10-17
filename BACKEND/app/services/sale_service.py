import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.sale import Sale, SaleItem, Payment, SaleStatus, PaymentMethod, PaymentStatus
from app.models.store import Shift, ShiftStatus
from app.models.product import Product
from app.models.customer import Customer
from app.models.inventory import MovementType
from app.schemas.sale import SaleCreateRequest, HoldSaleRequest
from app.services.pricing_service import PricingService
from app.services.inventory_service import InventoryService


class SaleService:
    def __init__(self, db: Session):
        self.db = db
        self.inventory_service = InventoryService(db)

    def checkout_sale(self, req: SaleCreateRequest, cashier_id: str) -> Sale:
        """
        Executes an atomic retail checkout:
        1. Verify active shift
        2. Resolve or create customer
        3. Authoritatively calculate prices and taxes per line item
        4. Deduct physical inventory atomically via MovementType.SALE
        5. Record payment records
        6. Update shift collection totals
        """
        # 1. Verify shift is OPEN
        shift = self.db.query(Shift).filter(
            Shift.id == req.shift_id,
            Shift.status == ShiftStatus.OPEN
        ).first()
        if not shift:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Active shift is not open. Please open register shift first."
            )

        # 2. Customer handling
        customer_id = None
        if req.customer and req.customer.phone:
            customer = self.db.query(Customer).filter(Customer.phone == req.customer.phone).first()
            if not customer:
                customer = Customer(
                    name=req.customer.name,
                    phone=req.customer.phone,
                    email=req.customer.email
                )
                self.db.add(customer)
                self.db.flush()
            customer_id = customer.id

        sale_number = f"SALE-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"

        # 3. Process items & Authoritative pricing
        item_entities: List[SaleItem] = []
        item_subtotals: List[Decimal] = []
        item_taxes: List[Decimal] = []

        sale = Sale(
            sale_number=sale_number,
            store_id=req.store_id,
            shift_id=req.shift_id,
            cashier_id=cashier_id,
            customer_id=customer_id,
            status=SaleStatus.COMPLETED,
            subtotal=Decimal("0.00"),
            discount_amount=Decimal("0.00"),
            tax_amount=Decimal("0.00"),
            round_off=Decimal("0.00"),
            grand_total=Decimal("0.00"),
            notes=req.notes
        )
        self.db.add(sale)
        self.db.flush()

        for item_req in req.items:
            product = self.db.query(Product).filter(
                Product.id == item_req.product_id,
                Product.is_active == True
            ).first()

            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {item_req.product_id} not found or inactive"
                )

            pricing = PricingService.calculate_line_item(
                weight_kg=item_req.weight_kg,
                unit_price=product.selling_price,
                discount_amount=item_req.discount_amount,
                tax_rate_percent=product.tax_rate
            )

            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=product.id,
                product_name=product.name,
                cut_type=item_req.cut_type,
                weight_kg=item_req.weight_kg,
                unit_price=product.selling_price,
                discount_amount=item_req.discount_amount,
                tax_rate=product.tax_rate,
                tax_amount=pricing["tax_amount"],
                subtotal=pricing["subtotal"]
            )
            item_entities.append(sale_item)
            item_subtotals.append(pricing["subtotal"])
            item_taxes.append(pricing["tax_amount"])

            # 4. Atomic Inventory Deduction
            self.inventory_service.record_movement(
                product_id=product.id,
                store_id=req.store_id,
                movement_type=MovementType.SALE,
                quantity=item_req.weight_kg,
                reference_id=sale.sale_number,
                user_id=cashier_id,
                notes=f"Retail Sale Item: {product.name} ({item_req.cut_type})"
            )

        # 5. Calculate Final Sale Totals
        totals = PricingService.calculate_sale_totals(
            item_subtotals=item_subtotals,
            item_taxes=item_taxes,
            overall_discount=req.overall_discount
        )

        sale.subtotal = totals["subtotal"]
        sale.discount_amount = totals["discount_amount"]
        sale.tax_amount = totals["tax_amount"]
        sale.round_off = totals["round_off"]
        sale.grand_total = totals["grand_total"]
        sale.items = item_entities

        # 6. Process Payments
        for p_req in req.payments:
            change_due = Decimal("0.00")
            if p_req.tendered_amount and p_req.tendered_amount > p_req.amount:
                change_due = p_req.tendered_amount - p_req.amount

            payment = Payment(
                sale_id=sale.id,
                payment_method=p_req.payment_method,
                status=PaymentStatus.PAID,
                amount=p_req.amount,
                tendered_amount=p_req.tendered_amount,
                change_due=change_due,
                transaction_ref=p_req.transaction_ref
            )
            self.db.add(payment)

            # Update shift running collections
            if p_req.payment_method == PaymentMethod.CASH:
                shift.cash_sales_amount += p_req.amount
                shift.expected_cash += p_req.amount
            elif p_req.payment_method == PaymentMethod.CARD:
                shift.card_sales_amount += p_req.amount
            elif p_req.payment_method == PaymentMethod.UPI:
                shift.upi_sales_amount += p_req.amount

        shift.total_sales_amount += sale.grand_total
        shift.total_transactions += 1

        if customer_id:
            customer = self.db.query(Customer).filter(Customer.id == customer_id).first()
            if customer:
                customer.total_spent += sale.grand_total
                customer.loyalty_points += int(sale.grand_total // 100)

        self.db.commit()
        self.db.refresh(sale)
        return sale

    def hold_sale(self, req: HoldSaleRequest, cashier_id: str) -> Sale:
        """
        Temporarily holds an in-progress cart without deducting stock.
        """
        sale_number = f"HOLD-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"

        sale = Sale(
            sale_number=sale_number,
            store_id=req.store_id,
            shift_id=req.shift_id,
            cashier_id=cashier_id,
            status=SaleStatus.HELD,
            subtotal=Decimal("0.00"),
            discount_amount=Decimal("0.00"),
            tax_amount=Decimal("0.00"),
            round_off=Decimal("0.00"),
            grand_total=Decimal("0.00"),
            notes=f"Held Order for {req.customer_name or 'Walk-in'}"
        )
        self.db.add(sale)
        self.db.flush()

        item_subtotals = []
        item_taxes = []
        for item_req in req.items:
            product = self.db.query(Product).filter(Product.id == item_req.product_id).first()
            if product:
                pricing = PricingService.calculate_line_item(
                    weight_kg=item_req.weight_kg,
                    unit_price=product.selling_price,
                    discount_amount=item_req.discount_amount,
                    tax_rate_percent=product.tax_rate
                )
                sale_item = SaleItem(
                    sale_id=sale.id,
                    product_id=product.id,
                    product_name=product.name,
                    cut_type=item_req.cut_type,
                    weight_kg=item_req.weight_kg,
                    unit_price=product.selling_price,
                    discount_amount=item_req.discount_amount,
                    tax_rate=product.tax_rate,
                    tax_amount=pricing["tax_amount"],
                    subtotal=pricing["subtotal"]
                )
                self.db.add(sale_item)
                item_subtotals.append(pricing["subtotal"])
                item_taxes.append(pricing["tax_amount"])

        totals = PricingService.calculate_sale_totals(item_subtotals, item_taxes)
        sale.subtotal = totals["subtotal"]
        sale.grand_total = totals["grand_total"]

        self.db.commit()
        self.db.refresh(sale)
        return sale
