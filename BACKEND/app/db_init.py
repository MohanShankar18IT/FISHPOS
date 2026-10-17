from decimal import Decimal
from app.core.database import engine, Base, SessionLocal
from app.core.config import settings
from app.core.security import get_password_hash
import app.models  # Load all models
from app.models.user import User, UserRole
from app.models.store import Store, Shift, ShiftStatus
from app.models.product import Category, Product, UnitType
from app.models.inventory import Inventory, BatchLot
from app.models.supplier import Supplier, Purchase, PurchaseItem
from app.models.permission import Permission, RolePermission, SystemSetting


def init_db():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

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
                email="contact@meanomeen.com"
            )
            db.add(store)
            db.flush()
            print(f"[OK] Seeded default store: {store.name}")

        # 2. Seed All 5 User Roles
        demo_users = [
            {
                "username": "admin",
                "email": "admin@meanomeen.com",
                "full_name": "Store SuperAdmin",
                "password": "admin123",
                "role": UserRole.SUPER_ADMIN,
                "phone": "+91 98400 00001"
            },
            {
                "username": "manager1",
                "email": "manager@meanomeen.com",
                "full_name": "Prakash Store Manager",
                "password": "manager123",
                "role": UserRole.STORE_MANAGER,
                "phone": "+91 98400 00002"
            },
            {
                "username": "cashier1",
                "email": "cashier@meanomeen.com",
                "full_name": "Karthik Cashier",
                "password": "cashier123",
                "role": UserRole.CASHIER,
                "phone": "+91 98400 00003"
            },
            {
                "username": "inventory1",
                "email": "inventory@meanomeen.com",
                "full_name": "Ramesh Inventory Chief",
                "password": "inventory123",
                "role": UserRole.INVENTORY_MANAGER,
                "phone": "+91 98400 00004"
            },
            {
                "username": "online1",
                "email": "online@meanomeen.com",
                "full_name": "Deepa Online Dispatcher",
                "password": "online123",
                "role": UserRole.ONLINE_ORDER_MANAGER,
                "phone": "+91 98400 00005"
            }
        ]

        user_map = {}
        for u_data in demo_users:
            user = db.query(User).filter(User.username == u_data["username"]).first()
            if not user:
                user = User(
                    username=u_data["username"],
                    email=u_data["email"],
                    full_name=u_data["full_name"],
                    hashed_password=get_password_hash(u_data["password"]),
                    role=u_data["role"],
                    phone=u_data["phone"]
                )
                db.add(user)
                db.flush()
                print(f"[OK] Seeded user: {user.username} ({user.role.value})")
            user_map[u_data["username"]] = user

        # 3. Seed Permissions & Role Permissions Access Matrix
        modules_permissions = [
            # POS Counter Module
            ("POS", "CREATE_SALE", "Create Retail Sale & Bill", [UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER, UserRole.CASHIER]),
            ("POS", "APPLY_DISCOUNT", "Apply Item & Bill Discounts", [UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER, UserRole.CASHIER]),
            ("POS", "PRICE_OVERRIDE", "Manual Unit Price Override", [UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER]),
            ("POS", "HOLD_RECALL_SALE", "Hold and Recall Suspended Carts", [UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER, UserRole.CASHIER]),
            ("POS", "VOID_SALE", "Void Completed Sale Transaction", [UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER]),
            # Inventory Module
            ("INVENTORY", "VIEW_STOCK", "View Real-time Physical & Available Stock", [UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER, UserRole.INVENTORY_MANAGER, UserRole.CASHIER, UserRole.ONLINE_ORDER_MANAGER]),
            ("INVENTORY", "RECEIVE_BATCH", "Receive Fresh Catch Lots", [UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER, UserRole.INVENTORY_MANAGER]),
            ("INVENTORY", "ADJUST_STOCK", "Manual Stock Adjustments", [UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER, UserRole.INVENTORY_MANAGER]),
            ("INVENTORY", "RECORD_WASTAGE", "Record Spoilage & Cutting Loss", [UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER, UserRole.INVENTORY_MANAGER, UserRole.CASHIER]),
            # Online Orders Module
            ("ONLINE_ORDERS", "VIEW_ORDERS", "View Online Orders Board", [UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER, UserRole.ONLINE_ORDER_MANAGER]),
            ("ONLINE_ORDERS", "PROCESS_ORDER", "Accept & Cut Fish for Online Order", [UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER, UserRole.ONLINE_ORDER_MANAGER]),
            ("ONLINE_ORDERS", "DISPATCH_ORDER", "Handover to Delivery / Mark Delivered", [UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER, UserRole.ONLINE_ORDER_MANAGER]),
            # Returns Module
            ("RETURNS", "PROCESS_RETURN", "Process Fish Sale Return & Refund", [UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER]),
            # Purchases & Suppliers
            ("PURCHASES", "MANAGE_PURCHASES", "Create Purchases & Supplier POs", [UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER, UserRole.INVENTORY_MANAGER]),
            ("SUPPLIERS", "MANAGE_SUPPLIERS", "Add and Edit Seafood Suppliers", [UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER]),
            # Reports Module
            ("REPORTS", "VIEW_DAILY_SALES", "View Shift & Daily Revenue Reports", [UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER]),
            ("REPORTS", "VIEW_PROFIT_LOSS", "View Profit & Loss / Margin Reports", [UserRole.SUPER_ADMIN]),
            # System Admin
            ("SETTINGS", "MANAGE_USERS", "Manage Users, Cashiers, and Passwords", [UserRole.SUPER_ADMIN]),
            ("SETTINGS", "SYSTEM_CONFIG", "Manage Store Hardware, GST, & Settings", [UserRole.SUPER_ADMIN]),
        ]

        for mod, act, name, allowed_roles in modules_permissions:
            perm = db.query(Permission).filter(Permission.module == mod, Permission.action == act).first()
            if not perm:
                perm = Permission(module=mod, action=act, name=name, description=f"Permission to {act} in {mod}")
                db.add(perm)
                db.flush()

            for role_enum in UserRole:
                is_granted = role_enum in allowed_roles
                rp = db.query(RolePermission).filter(
                    RolePermission.role == role_enum,
                    RolePermission.permission_id == perm.id
                ).first()
                if not rp:
                    rp = RolePermission(role=role_enum, permission_id=perm.id, is_granted=is_granted)
                    db.add(rp)

        # 4. Seed Suppliers
        suppliers_data = [
            {
                "code": "SUP-BHAVANI-01",
                "name": "Bhavanisagar Dam Inland Fisheries Coop",
                "contact_person": "Muthusamy Gounder",
                "phone": "+91 98422 11223",
                "email": "bhavani.fish@tamilnadu.coop",
                "address": "Bhavanisagar Reservoir Dock, Erode/Coimbatore",
                "gst_number": "33AAAAA1234A1Z1"
            },
            {
                "code": "SUP-COCHIN-02",
                "name": "Cochin Coastal Trawlers Guild",
                "contact_person": "George Varghese",
                "phone": "+91 94470 55667",
                "email": "cochin.trawlers@kerala.fish",
                "address": "Munambam Harbor, Kochi, Kerala",
                "gst_number": "32BBBBB5678B1Z2"
            }
        ]

        for s_data in suppliers_data:
            sup = db.query(Supplier).filter(Supplier.code == s_data["code"]).first()
            if not sup:
                sup = Supplier(**s_data)
                db.add(sup)
                db.flush()
                print(f"[OK] Seeded supplier: {sup.name}")

        # 5. Seed Shift
        open_shift = db.query(Shift).filter(Shift.store_id == store.id, Shift.status == ShiftStatus.OPEN).first()
        if not open_shift:
            open_shift = Shift(
                store_id=store.id,
                cashier_id=user_map["cashier1"].id,
                register_number="REG-01",
                status=ShiftStatus.OPEN,
                opening_cash=Decimal("2000.00"),
                expected_cash=Decimal("2000.00"),
                notes="Morning Shift Opening Float"
            )
            db.add(open_shift)

        # 6. Seed System Settings
        settings_defaults = [
            ("STORE_NAME", "Meanomeen Seafood Main Terminal", "Active Outlet Display Name"),
            ("STORE_GSTIN", "33AAAAA0000A1Z5", "Tax GST Identification Number"),
            ("DEFAULT_TAX_RATE", "5.0", "Default Seafood GST Percentage"),
            ("WEIGHING_SCALE_PORT", "COM3", "RS232 Serial Port for Digital Scale"),
            ("WEIGHING_SCALE_BAUD", "9600", "Baud rate for weighing indicator"),
            ("THERMAL_PRINTER_WIDTH", "80mm", "Thermal receipt paper width (58mm/80mm)"),
            ("AUTO_RESERVE_ONLINE_STOCK", "true", "Automatically reserve physical stock for pending online orders"),
        ]

        for k, v, desc in settings_defaults:
            setting = db.query(SystemSetting).filter(SystemSetting.key == k).first()
            if not setting:
                setting = SystemSetting(key=k, value=v, description=desc)
                db.add(setting)

        db.commit()
        print("[OK] All tables and master seed data successfully initialized!")
    except Exception as e:
        db.rollback()
        print(f"Error during db init: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
