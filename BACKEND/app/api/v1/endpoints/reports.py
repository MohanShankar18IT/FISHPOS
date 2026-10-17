from datetime import datetime, date, time
from decimal import Decimal
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, desc, or_
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.sale import Sale, SaleItem, Payment, PaymentMethod, SaleStatus
from app.models.inventory import Inventory, InventoryMovement, BatchLot, MovementType, WastageReason
from app.models.product import Product, Category
from app.models.supplier import Supplier, Purchase, PurchaseItem
from app.models.store import Shift, ShiftStatus
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["Reports & Summaries"])


def parse_date_range(start_date: Optional[str], end_date: Optional[str]):
    """Helper to parse date strings into datetime bounds."""
    start_dt = None
    end_dt = None
    if start_date:
        try:
            d = datetime.strptime(start_date, "%Y-%m-%d").date()
            start_dt = datetime.combine(d, time.min)
        except ValueError:
            pass
    if end_date:
        try:
            d = datetime.strptime(end_date, "%Y-%m-%d").date()
            end_dt = datetime.combine(d, time.max)
        except ValueError:
            pass
    return start_dt, end_dt


@router.get("/daily-sales")
@router.get("/sales-summary")
def get_sales_summary(
    store_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    cashier_id: Optional[str] = None,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Returns aggregate sales metrics, payment mode splits, top selling products, and hourly distribution.
    """
    start_dt, end_dt = parse_date_range(start_date, end_date)

    query = db.query(Sale).filter(Sale.store_id == store_id, Sale.status == SaleStatus.COMPLETED)
    if start_dt:
        query = query.filter(Sale.created_at >= start_dt)
    if end_dt:
        query = query.filter(Sale.created_at <= end_dt)
    if cashier_id:
        query = query.filter(Sale.cashier_id == cashier_id)

    sales = query.all()
    sale_ids = [s.id for s in sales]

    total_gross = sum(s.grand_total for s in sales)
    total_tax = sum(s.tax_amount for s in sales)
    total_discount = sum(s.discount_amount for s in sales)
    total_subtotal = sum(s.subtotal for s in sales)
    total_count = len(sales)

    # Payment breakdown
    payments = db.query(Payment).filter(Payment.sale_id.in_(sale_ids)).all() if sale_ids else []
    cash_collected = sum(p.amount for p in payments if p.payment_method == PaymentMethod.CASH)
    upi_collected = sum(p.amount for p in payments if p.payment_method == PaymentMethod.UPI)
    card_collected = sum(p.amount for p in payments if p.payment_method == PaymentMethod.CARD)

    # Itemized Product Sales Aggregation
    top_products = []
    if sale_ids:
        items_query = db.query(
            SaleItem.product_id,
            SaleItem.product_name,
            func.sum(SaleItem.weight_kg).label("total_weight"),
            func.sum(SaleItem.subtotal).label("total_revenue"),
            func.count(SaleItem.id).label("order_count")
        ).filter(SaleItem.sale_id.in_(sale_ids)).group_by(SaleItem.product_id, SaleItem.product_name)

        for row in items_query.order_by(desc("total_revenue")).limit(10).all():
            top_products.append({
                "product_id": row.product_id,
                "product_name": row.product_name,
                "weight_kg": Decimal(str(row.total_weight or 0)).quantize(Decimal("0.001")),
                "revenue": Decimal(str(row.total_revenue or 0)).quantize(Decimal("0.01")),
                "order_count": row.order_count
            })

    # Hourly distribution
    hourly_distribution: Dict[int, Dict[str, Any]] = {h: {"hour": h, "sales_count": 0, "revenue": Decimal("0.00")} for h in range(24)}
    for s in sales:
        h = s.created_at.hour
        hourly_distribution[h]["sales_count"] += 1
        hourly_distribution[h]["revenue"] += s.grand_total

    return {
        "store_id": store_id,
        "date_range": {"start_date": start_date, "end_date": end_date},
        "gross_sales": total_gross,
        "net_sales": total_subtotal - total_discount,
        "total_tax": total_tax,
        "total_discount": total_discount,
        "transaction_count": total_count,
        "average_basket_size": (total_gross / total_count).quantize(Decimal("0.01")) if total_count > 0 else Decimal("0.00"),
        "payment_breakdown": {
            "cash": cash_collected,
            "upi": upi_collected,
            "card": card_collected,
            "total": cash_collected + upi_collected + card_collected
        },
        "top_products": top_products,
        "hourly_sales": list(hourly_distribution.values())
    }


@router.get("/sales-register")
def get_sales_register(
    store_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    payment_method: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Returns list of sales transactions with line items and payment details for invoice register.
    """
    start_dt, end_dt = parse_date_range(start_date, end_date)

    query = db.query(Sale).filter(Sale.store_id == store_id)
    if start_dt:
        query = query.filter(Sale.created_at >= start_dt)
    if end_dt:
        query = query.filter(Sale.created_at <= end_dt)
    if status:
        query = query.filter(Sale.status == status)

    if search:
        query = query.filter(
            or_(
                Sale.sale_number.ilike(f"%{search}%"),
                Sale.notes.ilike(f"%{search}%")
            )
        )

    sales = query.order_by(Sale.created_at.desc()).limit(limit).all()

    results = []
    for s in sales:
        pay_methods = [p.payment_method.value for p in s.payments]
        if payment_method and payment_method not in pay_methods:
            continue

        results.append({
            "id": s.id,
            "sale_number": s.sale_number,
            "created_at": s.created_at.isoformat(),
            "cashier_name": s.cashier.full_name if s.cashier else "Cashier",
            "customer_name": s.customer.name if s.customer else "Walk-in Guest",
            "customer_phone": s.customer.phone if s.customer else "",
            "status": s.status.value,
            "subtotal": s.subtotal,
            "discount_amount": s.discount_amount,
            "tax_amount": s.tax_amount,
            "round_off": s.round_off,
            "grand_total": s.grand_total,
            "payment_methods": pay_methods,
            "items_count": len(s.items),
            "items": [
                {
                    "product_id": it.product_id,
                    "product_name": it.product_name,
                    "cut_type": it.cut_type,
                    "weight_kg": it.weight_kg,
                    "unit_price": it.unit_price,
                    "subtotal": it.subtotal
                }
                for it in s.items
            ]
        })

    return results


@router.get("/purchase-report")
def get_purchase_report(
    store_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    supplier_id: Optional[str] = None,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Returns procurement report, supplier breakdown, and fresh catch lot intakes.
    """
    start_dt, end_dt = parse_date_range(start_date, end_date)

    p_query = db.query(Purchase).filter(Purchase.store_id == store_id)
    if start_dt:
        p_query = p_query.filter(Purchase.purchase_date >= start_dt)
    if end_dt:
        p_query = p_query.filter(Purchase.purchase_date <= end_dt)
    if supplier_id:
        p_query = p_query.filter(Purchase.supplier_id == supplier_id)

    purchases = p_query.order_by(Purchase.purchase_date.desc()).all()

    b_query = db.query(BatchLot)
    if start_dt:
        b_query = b_query.filter(BatchLot.received_at >= start_dt)
    if end_dt:
        b_query = b_query.filter(BatchLot.received_at <= end_dt)

    batches = b_query.order_by(BatchLot.received_at.desc()).all()

    total_spend = sum(p.total_amount for p in purchases)
    total_batch_cost = sum(b.received_weight_kg * b.cost_per_kg for b in batches)
    total_spend = total_spend or total_batch_cost

    total_weight = sum(b.received_weight_kg for b in batches)
    avg_cost_kg = (total_spend / total_weight).quantize(Decimal("0.01")) if total_weight > 0 else Decimal("0.00")

    supplier_breakdown: Dict[str, Dict[str, Any]] = {}
    for b in batches:
        sup = b.supplier_name or "Harbor Boat Master"
        if sup not in supplier_breakdown:
            supplier_breakdown[sup] = {
                "supplier_name": sup,
                "landing_port": b.landing_port or "Harbor",
                "total_weight_kg": Decimal("0.000"),
                "total_spend": Decimal("0.00"),
                "lots_count": 0
            }
        supplier_breakdown[sup]["total_weight_kg"] += b.received_weight_kg
        supplier_breakdown[sup]["total_spend"] += (b.received_weight_kg * b.cost_per_kg)
        supplier_breakdown[sup]["lots_count"] += 1

    lot_records = []
    for b in batches:
        product = db.query(Product).filter(Product.id == b.product_id).first()
        lot_records.append({
            "id": b.id,
            "lot_number": b.lot_number,
            "product_name": product.name if product else "Fish Lot",
            "supplier_name": b.supplier_name or "Harbor Vendor",
            "landing_port": b.landing_port or "Kasimedu Harbor",
            "received_weight_kg": b.received_weight_kg,
            "cost_per_kg": b.cost_per_kg,
            "total_value": (b.received_weight_kg * b.cost_per_kg).quantize(Decimal("0.01")),
            "received_at": b.received_at.isoformat(),
            "expiry_date": b.expiry_date.isoformat() if b.expiry_date else None
        })

    return {
        "store_id": store_id,
        "total_spend": total_spend,
        "total_weight_kg": total_weight,
        "average_cost_per_kg": avg_cost_kg,
        "active_lots_count": len(batches),
        "supplier_breakdown": list(supplier_breakdown.values()),
        "lots": lot_records
    }


@router.get("/stock-report")
def get_stock_report(
    store_id: str,
    category_id: Optional[str] = None,
    low_stock_only: bool = False,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Returns real-time physical, reserved, and available stock levels along with stock valuation at cost and retail.
    """
    query = db.query(Inventory).filter(Inventory.store_id == store_id)
    stocks = query.all()

    items = []
    total_cost_valuation = Decimal("0.00")
    total_retail_valuation = Decimal("0.00")
    total_physical_weight = Decimal("0.000")
    total_reserved_weight = Decimal("0.000")
    low_stock_count = 0

    for s in stocks:
        p = s.product
        if not p:
            continue
        if category_id and p.category_id != category_id:
            continue

        is_low = s.available_stock <= p.min_stock_alert
        if low_stock_only and not is_low:
            continue

        if is_low:
            low_stock_count += 1

        cost_val = (s.physical_stock * p.cost_price).quantize(Decimal("0.01"))
        retail_val = (s.physical_stock * p.selling_price).quantize(Decimal("0.01"))

        total_cost_valuation += cost_val
        total_retail_valuation += retail_val
        total_physical_weight += s.physical_stock
        total_reserved_weight += s.reserved_stock

        items.append({
            "product_id": p.id,
            "sku": p.sku,
            "product_name": p.name,
            "local_name": p.local_name,
            "category_name": p.category.name if p.category else "General",
            "unit_type": p.unit_type.value,
            "cost_price": p.cost_price,
            "selling_price": p.selling_price,
            "physical_stock": s.physical_stock,
            "reserved_stock": s.reserved_stock,
            "available_stock": s.available_stock,
            "min_stock_alert": p.min_stock_alert,
            "is_low_stock": is_low,
            "cost_valuation": cost_val,
            "retail_valuation": retail_val,
            "updated_at": s.updated_at.isoformat()
        })

    potential_margin = (
        ((total_retail_valuation - total_cost_valuation) / total_retail_valuation * 100).quantize(Decimal("0.1"))
        if total_retail_valuation > 0 else Decimal("0.0")
    )

    return {
        "store_id": store_id,
        "total_items_count": len(items),
        "total_physical_weight_kg": total_physical_weight,
        "total_reserved_weight_kg": total_reserved_weight,
        "total_available_weight_kg": total_physical_weight - total_reserved_weight,
        "total_cost_valuation": total_cost_valuation,
        "total_retail_valuation": total_retail_valuation,
        "potential_gross_margin_pct": potential_margin,
        "low_stock_count": low_stock_count,
        "items": items
    }


@router.get("/wastage-summary")
@router.get("/wastage-report")
def get_wastage_report(
    store_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Returns wastage, gutting loss, and spoilage analytics with loss valuation.
    """
    start_dt, end_dt = parse_date_range(start_date, end_date)

    query = db.query(InventoryMovement).filter(
        InventoryMovement.store_id == store_id,
        InventoryMovement.movement_type == MovementType.WASTAGE
    )
    if start_dt:
        query = query.filter(InventoryMovement.created_at >= start_dt)
    if end_dt:
        query = query.filter(InventoryMovement.created_at <= end_dt)

    movements = query.order_by(InventoryMovement.created_at.desc()).all()

    total_wastage_kg = sum(m.quantity for m in movements)
    total_loss_value = Decimal("0.00")
    by_reason: Dict[str, Dict[str, Any]] = {}

    log_records = []
    for m in movements:
        product = db.query(Product).filter(Product.id == m.product_id).first()
        p_cost = product.cost_price if product else Decimal("0.00")
        item_loss = (m.quantity * p_cost).quantize(Decimal("0.01"))
        total_loss_value += item_loss

        r_key = m.wastage_reason.value if m.wastage_reason else "OTHER"
        if r_key not in by_reason:
            by_reason[r_key] = {"reason": r_key, "weight_kg": Decimal("0.000"), "loss_value": Decimal("0.00"), "count": 0}
        by_reason[r_key]["weight_kg"] += m.quantity
        by_reason[r_key]["loss_value"] += item_loss
        by_reason[r_key]["count"] += 1

        log_records.append({
            "id": m.id,
            "product_id": m.product_id,
            "product_name": product.name if product else "Fish Product",
            "quantity_kg": m.quantity,
            "wastage_reason": r_key,
            "estimated_loss_value": item_loss,
            "notes": m.notes,
            "created_at": m.created_at.isoformat()
        })

    return {
        "store_id": store_id,
        "total_wastage_kg": total_wastage_kg,
        "total_loss_value": total_loss_value,
        "entries_count": len(movements),
        "breakdown_by_reason": list(by_reason.values()),
        "records": log_records
    }


@router.get("/profit-tax")
def get_profit_and_tax_report(
    store_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Returns Gross Profit (Sales - COGS) and GST Compliance Summary (CGST 2.5%, SGST 2.5%).
    """
    start_dt, end_dt = parse_date_range(start_date, end_date)

    query = db.query(Sale).filter(Sale.store_id == store_id, Sale.status == SaleStatus.COMPLETED)
    if start_dt:
        query = query.filter(Sale.created_at >= start_dt)
    if end_dt:
        query = query.filter(Sale.created_at <= end_dt)

    sales = query.all()
    sale_ids = [s.id for s in sales]

    total_gross_revenue = sum(s.grand_total for s in sales)
    total_tax_collected = sum(s.tax_amount for s in sales)
    taxable_turnover = sum(s.subtotal - s.discount_amount for s in sales)

    # 5% GST split
    cgst_amount = (total_tax_collected / 2).quantize(Decimal("0.01"))
    sgst_amount = (total_tax_collected - cgst_amount).quantize(Decimal("0.01"))

    cogs_total = Decimal("0.00")
    if sale_ids:
        sale_items = db.query(SaleItem).filter(SaleItem.sale_id.in_(sale_ids)).all()
        for it in sale_items:
            prod = db.query(Product).filter(Product.id == it.product_id).first()
            if prod:
                cogs_total += (it.weight_kg * prod.cost_price)

    gross_profit = taxable_turnover - cogs_total
    gross_margin_pct = ((gross_profit / taxable_turnover) * 100).quantize(Decimal("0.1")) if taxable_turnover > 0 else Decimal("0.0")

    return {
        "store_id": store_id,
        "date_range": {"start_date": start_date, "end_date": end_date},
        "taxable_turnover": taxable_turnover,
        "cgst_amount_2_5": cgst_amount,
        "sgst_amount_2_5": sgst_amount,
        "total_tax_collected": total_tax_collected,
        "total_gross_revenue": total_gross_revenue,
        "cost_of_goods_sold": cogs_total.quantize(Decimal("0.01")),
        "gross_profit": gross_profit.quantize(Decimal("0.01")),
        "gross_margin_pct": gross_margin_pct
    }


@router.get("/shifts-summary")
def get_shifts_summary_report(
    store_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Returns historical register shift records with cash balancing over/short discrepancies.
    """
    start_dt, end_dt = parse_date_range(start_date, end_date)

    query = db.query(Shift).filter(Shift.store_id == store_id)
    if start_dt:
        query = query.filter(Shift.opened_at >= start_dt)
    if end_dt:
        query = query.filter(Shift.opened_at <= end_dt)

    shifts = query.order_by(Shift.opened_at.desc()).all()

    results = []
    for sh in shifts:
        results.append({
            "id": sh.id,
            "register_number": sh.register_number,
            "cashier_name": sh.cashier.full_name if sh.cashier else "Cashier",
            "status": sh.status.value,
            "opened_at": sh.opened_at.isoformat(),
            "closed_at": sh.closed_at.isoformat() if sh.closed_at else None,
            "opening_cash": sh.opening_cash,
            "total_sales_amount": sh.total_sales_amount,
            "cash_sales_amount": sh.cash_sales_amount,
            "card_sales_amount": sh.card_sales_amount,
            "upi_sales_amount": sh.upi_sales_amount,
            "expected_cash": sh.expected_cash,
            "actual_cash": sh.actual_cash,
            "cash_difference": sh.cash_difference,
            "total_transactions": sh.total_transactions,
            "notes": sh.notes
        })
    return results
