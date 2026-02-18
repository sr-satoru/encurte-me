import requests

BASE_URL = "http://localhost:8303"

def test_auth():
    # 1. Register
    print("Testing Registration...")
    reg_data = {
        "email": "test@example.com",
        "password": "securepassword123",
        "name": "Test User"
    }
    response = requests.post(f"{BASE_URL}/register", json=reg_data)
    print(f"Register Status: {response.status_code}")
    if response.status_code == 201:
        print(f"Register Body: {response.json()}")
    elif response.status_code == 400:
        print(f"User already exists (expected if re-running): {response.json()}")
    else:
        print(f"Unexpected Register Body: {response.text}")

    # 2. Login
    print("\nTesting Login...")
    login_data = {
        "email": "test@example.com",
        "password": "securepassword123"
    }
    session = requests.Session()
    response = session.post(f"{BASE_URL}/login", json=login_data)
    print(f"Login Status: {response.status_code}")
    print(f"Login Body: {response.json()}")
    print(f"Cookies: {session.cookies.get_dict()}")

    # 3. Get /me
    print("\nTesting /me (Protected Route)...")
    response = session.get(f"{BASE_URL}/me")
    print(f"Me Status: {response.status_code}")
    print(f"Me Body: {response.json()}")

    # 4. Logout
    print("\nTesting Logout...")
    response = session.post(f"{BASE_URL}/logout")
    print(f"Logout Status: {response.status_code}")
    print(f"Cookies after logout: {session.cookies.get_dict()}")

    # 5. Get /me after logout
    print("\nTesting /me after logout...")
    response = session.get(f"{BASE_URL}/me")
    print(f"Me after logout status: {response.status_code}")

if __name__ == "__main__":
    try:
        test_auth()
    except Exception as e:
        print(f"Error during test: {e}")
