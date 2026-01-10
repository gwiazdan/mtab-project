"""Tests for admin authentication endpoints"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.core.database import Base, get_db
from src.models.admin import Admin
from main import app


# Create test database
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_teardown():
    """Create test admin before each test, drop tables after"""
    Base.metadata.create_all(bind=engine)

    # Create test admin
    db = TestingSessionLocal()
    admin = Admin(username="testadmin", requires_password_change=True)
    admin.set_password("testpass123")
    db.add(admin)
    db.commit()
    db.close()

    yield

    # Cleanup
    Base.metadata.drop_all(bind=engine)


class TestAdminLogin:
    def test_login_success(self):
        """Test successful admin login"""
        response = client.post(
            "/api/v1/admin/login",
            json={"username": "testadmin", "password": "testpass123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "session_token" in data
        assert data["requires_password_change"] == True

    def test_login_invalid_username(self):
        """Test login with invalid username"""
        response = client.post(
            "/api/v1/admin/login",
            json={"username": "wronguser", "password": "testpass123"}
        )
        assert response.status_code == 401
        assert "Invalid" in response.json()["detail"]

    def test_login_invalid_password(self):
        """Test login with invalid password"""
        response = client.post(
            "/api/v1/admin/login",
            json={"username": "testadmin", "password": "wrongpass"}
        )
        assert response.status_code == 401
        assert "Invalid" in response.json()["detail"]


class TestAdminChangePassword:
    def test_change_password_success(self):
        """Test successful password change"""
        # Login first
        login_response = client.post(
            "/api/v1/admin/login",
            json={"username": "testadmin", "password": "testpass123"}
        )
        token = login_response.json()["session_token"]

        # Change password
        response = client.post(
            f"/api/v1/admin/change-password?token={token}",
            json={"old_password": "testpass123", "new_password": "newpass456"}
        )
        assert response.status_code == 200
        assert "Password changed" in response.json()["message"]

        # Verify old password doesn't work
        login_response = client.post(
            "/api/v1/admin/login",
            json={"username": "testadmin", "password": "testpass123"}
        )
        assert login_response.status_code == 401

        # Verify new password works
        login_response = client.post(
            "/api/v1/admin/login",
            json={"username": "testadmin", "password": "newpass456"}
        )
        assert login_response.status_code == 200
        assert login_response.json()["requires_password_change"] == False

    def test_change_password_invalid_token(self):
        """Test password change with invalid token"""
        response = client.post(
            "/api/v1/admin/change-password?token=invalid_token",
            json={"old_password": "testpass123", "new_password": "newpass456"}
        )
        assert response.status_code == 401
        assert "Invalid token" in response.json()["detail"]

    def test_change_password_wrong_old_password(self):
        """Test password change with wrong old password"""
        # Login first
        login_response = client.post(
            "/api/v1/admin/login",
            json={"username": "testadmin", "password": "testpass123"}
        )
        token = login_response.json()["session_token"]

        # Try to change with wrong old password
        response = client.post(
            f"/api/v1/admin/change-password?token={token}",
            json={"old_password": "wrongpass", "new_password": "newpass456"}
        )
        assert response.status_code == 401
        assert "Old password is incorrect" in response.json()["detail"]


class TestAdminVerifyToken:
    def test_verify_token_valid(self):
        """Test token verification with valid token"""
        # Login first
        login_response = client.post(
            "/api/v1/admin/login",
            json={"username": "testadmin", "password": "testpass123"}
        )
        token = login_response.json()["session_token"]

        # Verify token
        response = client.get(f"/api/v1/admin/verify?token={token}")
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == True
        assert "admin_id" in data

    def test_verify_token_invalid(self):
        """Test token verification with invalid token"""
        response = client.get("/api/v1/admin/verify?token=invalid_token")
        assert response.status_code == 200
        assert response.json()["valid"] == False


class TestAdminLogout:
    def test_logout_success(self):
        """Test successful logout"""
        # Login first
        login_response = client.post(
            "/api/v1/admin/login",
            json={"username": "testadmin", "password": "testpass123"}
        )
        token = login_response.json()["session_token"]

        # Verify token works
        verify_response = client.get(f"/api/v1/admin/verify?token={token}")
        assert verify_response.json()["valid"] == True

        # Logout
        response = client.post(f"/api/v1/admin/logout?token={token}")
        assert response.status_code == 200
        assert "Logged out" in response.json()["message"]

        # Verify token no longer works
        verify_response = client.get(f"/api/v1/admin/verify?token={token}")
        assert verify_response.json()["valid"] == False
