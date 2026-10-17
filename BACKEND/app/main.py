import sys
import os
from contextlib import asynccontextmanager
from decimal import Decimal

# Ensure backend root is always on sys.path even when running directly from app/ directory
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.v1.router import api_router
from app.models.user import User, UserRole
from app.models.store import Store, Shift, ShiftStatus
from app.models.product import Category, Product, UnitType
from app.models.inventory import Inventory
from app.core.security import get_password_hash


def seed_initial_demo_data():
    """
    Seeds initial store, demo cashier/admin, fish categories, products, and starting stock.
    """
    db = SessionLocal()
    try:
        # 1. Seed Store
        store = db.query(Store).filter(Store.code == settings.DEFAULT_STORE_CODE).first()
        if not store:
            store = Store(
                code=settings.DEFAULT_STORE_CODE,
                name=settings.DEFAULT_STORE_NAME,
                address="142, DB Road, RS Puram, Coimbatore - 641002",
                phone="+91 98422 12345",
                email="store@fishpos.local"
            )
            db.add(store)
            db.flush()

        # 2. Seed Admin & Cashier User
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@fishpos.local",
                full_name="Store SuperAdmin",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.SUPER_ADMIN,
                phone="+91 98400 00001"
            )
            db.add(admin)

        cashier = db.query(User).filter(User.username == "cashier1").first()
        if not cashier:
            cashier = User(
                username="cashier1",
                email="cashier1@fishpos.local",
                full_name="Karthik Cashier",
                hashed_password=get_password_hash("cashier123"),
                role=UserRole.CASHIER,
                phone="+91 98400 00002"
            )
            db.add(cashier)
            db.flush()

        # 3. Seed Shift
        open_shift = db.query(Shift).filter(Shift.store_id == store.id, Shift.status == ShiftStatus.OPEN).first()
        if not open_shift:
            open_shift = Shift(
                store_id=store.id,
                cashier_id=cashier.id,
                register_number="REG-01",
                status=ShiftStatus.OPEN,
                opening_cash=Decimal("2000.00"),
                expected_cash=Decimal("2000.00"),
                notes="Morning Shift Opening Float"
            )
            db.add(open_shift)

        # 4. Seed Categories
        categories_data = [
            {"name": "Sea Fish", "code": "CAT-SEA", "icon": "Fish", "display_order": 1},
            {"name": "Freshwater Fish", "code": "CAT-FRESH", "icon": "Waves", "display_order": 2},
            {"name": "Shellfish & Prawns", "code": "CAT-SHELL", "icon": "Shell", "display_order": 3},
            {"name": "Steaks & Fillets", "code": "CAT-STEAK", "icon": "Utensils", "display_order": 4},
            {"name": "Crabs & Lobsters", "code": "CAT-CRAB", "icon": "Boxes", "display_order": 5},
            {"name": "Dried Fish", "code": "CAT-DRIED", "icon": "Sun", "display_order": 6},
        ]

        cat_map = {}
        for c in categories_data:
            cat = db.query(Category).filter(Category.code == c["code"]).first()
            if not cat:
                cat = Category(
                    name=c["name"],
                    code=c["code"],
                    icon=c["icon"],
                    display_order=c["display_order"]
                )
                db.add(cat)
                db.flush()
            cat_map[c["code"]] = cat.id

        # 5. Seed Products
        products_data = [
            {
                "sku": "FISH-SEER-01",
                "barcode": "8901001",
                "name": "Seer Fish / Vanjaram",
                "local_name": "வஞ்சிரம் மீன் (King Fish)",
                "scientific_name": "Scomberomorus commerson",
                "category_code": "CAT-SEA",
                "unit_type": UnitType.KG,
                "selling_price": Decimal("950.00"),
                "cost_price": Decimal("750.00"),
                "tax_rate": Decimal("5.00"),
                "cut_options": ["Whole", "Curry Cut", "Steaks", "Fillet", "Head Separate"],
                "stock": Decimal("45.500")
            },
            {
                "sku": "FISH-POMFRET-W-02",
                "barcode": "8901002",
                "name": "White Pomfret / Vawval",
                "local_name": "வெள்ளை வவ்வால்",
                "scientific_name": "Pampus argenteus",
                "category_code": "CAT-SEA",
                "unit_type": UnitType.KG,
                "selling_price": Decimal("1100.00"),
                "cost_price": Decimal("900.00"),
                "tax_rate": Decimal("5.00"),
                "cut_options": ["Whole", "Cleaned & Gutted", "Curry Cut"],
                "stock": Decimal("28.250")
            },
            {
                "sku": "FISH-PRAWN-TIGER-03",
                "barcode": "8901003",
                "name": "Tiger Prawns (Medium-Large)",
                "local_name": "புலி இறால்",
                "scientific_name": "Penaeus monodon",
                "category_code": "CAT-SHELL",
                "unit_type": UnitType.KG,
                "selling_price": Decimal("650.00"),
                "cost_price": Decimal("480.00"),
                "tax_rate": Decimal("5.00"),
                "cut_options": ["Whole with Shell", "Headless", "Peeled & Deveined"],
                "stock": Decimal("35.000")
            },
            {
                "sku": "FISH-ROHU-04",
                "barcode": "8901004",
                "name": "Freshwater Rohu / Kendai",
                "local_name": "ரோகு கெண்டை",
                "scientific_name": "Labeo rohita",
                "category_code": "CAT-FRESH",
                "unit_type": UnitType.KG,
                "selling_price": Decimal("240.00"),
                "cost_price": Decimal("160.00"),
                "tax_rate": Decimal("5.00"),
                "cut_options": ["Whole", "Bengali Cut", "Curry Cut", "Head Off"],
                "stock": Decimal("60.000")
            },
            {
                "sku": "FISH-SARDINE-05",
                "barcode": "8901005",
                "name": "Indian Sardine / Mathi",
                "local_name": "மத்தி மீன்",
                "scientific_name": "Sardinella longiceps",
                "category_code": "CAT-SEA",
                "unit_type": UnitType.KG,
                "selling_price": Decimal("180.00"),
                "cost_price": Decimal("110.00"),
                "tax_rate": Decimal("5.00"),
                "cut_options": ["Whole", "Cleaned (Head & Tail Off)"],
                "stock": Decimal("80.000")
            },
            {
                "sku": "FISH-CRAB-BLUE-06",
                "barcode": "8901006",
                "name": "Blue Sea Crab / Nandu",
                "local_name": "நீல நண்டு",
                "scientific_name": "Portunus pelagicus",
                "category_code": "CAT-CRAB",
                "unit_type": UnitType.KG,
                "selling_price": Decimal("520.00"),
                "cost_price": Decimal("380.00"),
                "tax_rate": Decimal("5.00"),
                "cut_options": ["Live / Whole", "Cleaned & Quartered"],
                "stock": Decimal("22.500")
            },
            {
                "sku": "FISH-SALMON-FILLET-07",
                "barcode": "8901007",
                "name": "Atlantic Salmon Fillet",
                "local_name": "சால்மன் ஃபில்லட் (Imported)",
                "scientific_name": "Salmo salar",
                "category_code": "CAT-STEAK",
                "unit_type": UnitType.KG,
                "selling_price": Decimal("1850.00"),
                "cost_price": Decimal("1450.00"),
                "tax_rate": Decimal("5.00"),
                "cut_options": ["Portion Fillet", "Skin-on Slices", "Skinless"],
                "stock": Decimal("15.000")
            }
        ]

        for p_item in products_data:
            prod = db.query(Product).filter(Product.sku == p_item["sku"]).first()
            if not prod:
                prod = Product(
                    sku=p_item["sku"],
                    barcode=p_item["barcode"],
                    name=p_item["name"],
                    local_name=p_item["local_name"],
                    scientific_name=p_item["scientific_name"],
                    category_id=cat_map[p_item["category_code"]],
                    unit_type=p_item["unit_type"],
                    selling_price=p_item["selling_price"],
                    cost_price=p_item["cost_price"],
                    tax_rate=p_item["tax_rate"],
                    cut_options=p_item["cut_options"]
                )
                db.add(prod)
                db.flush()

                # Seed initial stock
                inv = Inventory(
                    product_id=prod.id,
                    store_id=store.id,
                    physical_stock=p_item["stock"],
                    reserved_stock=Decimal("0.000"),
                    available_stock=p_item["stock"]
                )
                db.add(inv)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Demo seeding notice: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables and initialize master data
    from app.db_init import init_db
    init_db()
    seed_initial_demo_data()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="High-velocity Fish POS Retail & Online Commerce Backend API",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred processing your request.",
                "details": str(exc) if settings.DEBUG else None
            }
        }
    )


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }


# Mount Versioned API Routes
app.include_router(api_router, prefix=settings.API_V1_STR)


if __name__ == "__main__":
    import uvicorn
    print("\nStarting Fish POS FastAPI Server on http://localhost:8000 ...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
