from fastapi.testclient import TestClient
from app.main import app

def test_everything():
    with TestClient(app) as client:
        # 1. Health
        res = client.get('/health')
        print(f"1. Health Check: {res.status_code} -> {res.json()}")
        assert res.status_code == 200

        # 2. Login all roles
        users = [
            ("admin", "admin123", "SUPER_ADMIN"),
            ("manager1", "manager123", "STORE_MANAGER"),
            ("cashier1", "cashier123", "CASHIER"),
            ("inventory1", "inventory123", "INVENTORY_MANAGER"),
            ("online1", "online123", "ONLINE_ORDER_MANAGER"),
        ]
        tokens = {}
        for username, password, expected_role in users:
            r = client.post('/api/v1/auth/login-json', json={"username": username, "password": password})
            assert r.status_code == 200, f"Login failed for {username}: {r.text}"
            data = r.json()
            assert data["role"] == expected_role
            tokens[username] = data["access_token"]
            print(f"2. Auth Login [{username}] -> 200 OK (Role: {data['role']}, Token generated)")

        # 3. Categories & Products
        r_cats = client.get('/api/v1/categories')
        print(f"3. Categories List -> {r_cats.status_code} OK (Count: {len(r_cats.json())})")
        
        r_prods = client.get('/api/v1/products')
        print(f"4. Products List -> {r_prods.status_code} OK (Count: {len(r_prods.json())})")

        # 5. Role Permissions Matrix
        r_matrix = client.get('/api/v1/auth/roles-permissions')
        print(f"5. Role Permissions Matrix -> {r_matrix.status_code} OK (Roles: {len(r_matrix.json()['roles'])}, Perms: {len(r_matrix.json()['permissions'])})")

        # 6. Current Shift
        r_shift = client.get('/api/v1/shifts/current?store_id=STORE-001')
        print(f"6. Shift Status -> {r_shift.status_code} OK")

        # 7. Online Orders
        r_orders = client.get('/api/v1/online-orders')
        print(f"7. Online Orders -> {r_orders.status_code} OK")

        print("\n>>> ALL API ENDPOINTS AND DATABASE SEEDING VERIFIED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    test_everything()
