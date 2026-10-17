import sqlite3
import os
import sys

# Ensure backend root is on path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from app.core.database import engine, Base
import app.models
from app.db_init import init_db

def migrate():
    print("Checking and applying SQLite schema updates...")
    db_path = os.path.join(CURRENT_DIR, "fish_pos.db")
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check stores columns
        cursor.execute("PRAGMA table_info(stores)")
        columns = [row[1] for row in cursor.fetchall()]
        print(f"Current columns in 'stores': {columns}")
        
        needed_columns = {
            "company_id": "VARCHAR(36)",
            "branch_type": "VARCHAR(30) DEFAULT 'RETAIL_STORE'",
            "city": "VARCHAR(100) DEFAULT 'Coimbatore'",
            "state": "VARCHAR(100) DEFAULT 'Tamil Nadu'",
            "pincode": "VARCHAR(10) DEFAULT '641002'",
            "gstin": "VARCHAR(20)",
            "fssai_state_license": "VARCHAR(30)",
            "contact_person": "VARCHAR(100)",
            "num_registers": "NUMERIC(4, 0) DEFAULT 2",
            "chiller_capacity_kg": "NUMERIC(10, 3) DEFAULT 500.0",
            "scale_ip": "VARCHAR(50) DEFAULT '192.168.1.120'",
            "scale_port": "NUMERIC(6, 0) DEFAULT 9100"
        }
        
        for col, col_type in needed_columns.items():
            if col not in columns:
                print(f"Adding column '{col}' ({col_type}) to 'stores' table...")
                cursor.execute(f"ALTER TABLE stores ADD COLUMN {col} {col_type}")
        
        conn.commit()
        conn.close()
    
    # Run SQLAlchemy create_all for any brand new tables (e.g. companies) and seed
    Base.metadata.create_all(bind=engine)
    init_db()

    # Link existing stores with missing company_id to default company
    from app.core.database import SessionLocal
    from app.models.store import Store
    from app.models.company import Company
    
    db = SessionLocal()
    try:
        default_company = db.query(Company).first()
        if default_company:
            unlinked_stores = db.query(Store).filter(Store.company_id.is_(None)).all()
            for st in unlinked_stores:
                st.company_id = default_company.id
            db.commit()
            print(f"[OK] Linked {len(unlinked_stores)} stores to default company {default_company.legal_name}")
    finally:
        db.close()
    
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
