from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    products,
    categories,
    sales,
    inventory,
    online_orders,
    shifts,
    reports,
    customers,
    masters
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(products.router)
api_router.include_router(categories.router)
api_router.include_router(sales.router)
api_router.include_router(inventory.router)
api_router.include_router(online_orders.router)
api_router.include_router(shifts.router)
api_router.include_router(reports.router)
api_router.include_router(customers.router)
api_router.include_router(masters.router, prefix="/masters", tags=["Masters"])
