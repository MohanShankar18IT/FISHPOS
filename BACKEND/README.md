# Fish POS — Backend Service (FastAPI)

Production-grade, modular backend API service for **Fish POS (Point of Sale & Online Commerce Platform)**.

## Architecture Highlights
- **Framework**: FastAPI (Python 3.11+)
- **ORM & DB**: SQLAlchemy 2.0 + PostgreSQL (SQLite fallback for rapid zero-config local development)
- **Migrations**: Alembic
- **Validation**: Pydantic v2
- **Security**: JWT Authentication + Role-Based Access Control (`SUPER_ADMIN`, `STORE_MANAGER`, `CASHIER`, `INVENTORY_MANAGER`, `ONLINE_ORDER_MANAGER`)

---

## Getting Started

### 1. Environment Setup
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 2. Run Database & Application
```bash
# Start FastAPI development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. API Documentation
Once running, explore interactive Swagger docs at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### 4. Default Seed Credentials
- **Admin**: `username: admin`, `password: admin123`
- **Cashier**: `username: cashier1`, `password: cashier123`
