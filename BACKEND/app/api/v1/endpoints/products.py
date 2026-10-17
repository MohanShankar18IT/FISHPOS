from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.product import Product, Category, ProductPriceHistory
from app.models.inventory import Inventory
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    PriceUpdateSchema,
    BulkPriceUpdateRequest,
    ProductPriceHistoryResponse
)

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=List[ProductResponse])
def get_products(
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    store_id: Optional[str] = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if not include_inactive:
        query = query.filter(Product.is_active == True)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(search_filter)) |
            (Product.local_name.ilike(search_filter)) |
            (Product.sku.ilike(search_filter)) |
            (Product.barcode == search)
        )

    products = query.order_by(Product.name.asc()).all()
    results = []
    for p in products:
        cat_name = p.category.name if p.category else None
        # Calculate current stock if store_id provided
        stock_val = Decimal("0.000")
        if store_id:
            inv = db.query(Inventory).filter(Inventory.product_id == p.id, Inventory.store_id == store_id).first()
            if inv:
                stock_val = inv.available_stock
        else:
            # Sum all store available stock
            total_inv = db.query(Inventory).filter(Inventory.product_id == p.id).all()
            if total_inv:
                stock_val = sum((i.available_stock for i in total_inv), Decimal("0.000"))

        p_dict = ProductResponse.model_validate(p)
        p_dict.category_name = cat_name
        p_dict.current_stock = stock_val
        results.append(p_dict)
    return results


@router.get("/{product_id}", response_model=ProductResponse)
def get_product_by_id(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    resp = ProductResponse.model_validate(product)
    resp.category_name = product.category.name if product.category else None
    return resp


@router.post("", response_model=ProductResponse)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Product).filter(Product.sku == product_in.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product with this SKU already exists")

    product = Product(**product_in.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)

    # Initial Price History Log
    history = ProductPriceHistory(
        product_id=product.id,
        old_selling_price=Decimal("0.00"),
        new_selling_price=product.selling_price,
        changed_by=current_user.id if current_user else None,
        reason="Initial Product Creation & Rate Setup"
    )
    db.add(history)
    db.commit()

    resp = ProductResponse.model_validate(product)
    resp.category_name = product.category.name if product.category else None
    return resp


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    old_price = product.selling_price
    update_data = product_in.model_dump(exclude_unset=True)

    # Check if price changed
    price_changed = False
    if "selling_price" in update_data and update_data["selling_price"] is not None:
        if update_data["selling_price"] != old_price:
            price_changed = True

    for field, value in update_data.items():
        setattr(product, field, value)

    if price_changed:
        history = ProductPriceHistory(
            product_id=product.id,
            old_selling_price=old_price,
            new_selling_price=product.selling_price,
            changed_by=current_user.id if current_user else None,
            reason="Product Update Master Edit"
        )
        db.add(history)

    db.commit()
    db.refresh(product)
    resp = ProductResponse.model_validate(product)
    resp.category_name = product.category.name if product.category else None
    return resp


@router.delete("/{product_id}")
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Soft delete
    product.is_active = False
    db.commit()
    return {"message": "Product archived/deactivated successfully", "id": product_id}


@router.post("/{product_id}/price", response_model=ProductResponse)
def update_product_price(
    product_id: str,
    price_data: PriceUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    old_price = product.selling_price
    product.selling_price = price_data.new_selling_price

    # Record immutable audit history
    history = ProductPriceHistory(
        product_id=product.id,
        old_selling_price=old_price,
        new_selling_price=price_data.new_selling_price,
        changed_by=current_user.id if current_user else None,
        reason=price_data.reason or "Manual Price Update"
    )
    db.add(history)
    db.commit()
    db.refresh(product)
    resp = ProductResponse.model_validate(product)
    resp.category_name = product.category.name if product.category else None
    return resp


@router.get("/{product_id}/price-history", response_model=List[ProductPriceHistoryResponse])
def get_product_price_history(product_id: str, db: Session = Depends(get_db)):
    history = (
        db.query(ProductPriceHistory)
        .filter(ProductPriceHistory.product_id == product_id)
        .order_by(ProductPriceHistory.changed_at.desc())
        .all()
    )
    return history


@router.post("/bulk-price-update", response_model=List[ProductResponse])
def bulk_price_update(
    bulk_data: BulkPriceUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated_products = []
    for item in bulk_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            old_price = product.selling_price
            product.selling_price = item.new_selling_price

            history = ProductPriceHistory(
                product_id=product.id,
                old_selling_price=old_price,
                new_selling_price=item.new_selling_price,
                changed_by=current_user.id if current_user else None,
                reason=bulk_data.reason or "Bulk Morning Landing Rate Update"
            )
            db.add(history)
            updated_products.append(product)

    db.commit()
    for p in updated_products:
        db.refresh(p)

    results = []
    for p in updated_products:
        resp = ProductResponse.model_validate(p)
        resp.category_name = p.category.name if p.category else None
        results.append(resp)
    return results

