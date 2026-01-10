from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.admin import Admin
from src.schemas.admin import (
    AdminLoginRequest,
    AdminLoginResponse,
    AdminChangePasswordRequest,
)
import secrets

router = APIRouter(prefix="/admin", tags=["admin"])

# In-memory session store: {token: admin_id}
admin_sessions = {}


@router.post("/login", response_model=AdminLoginResponse)
def login(request: AdminLoginRequest, db: Session = Depends(get_db)):
    """Admin login endpoint"""
    admin = db.query(Admin).filter(Admin.username == request.username).first()

    if not admin or not admin.verify_password(request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Generate session token
    session_token = secrets.token_urlsafe(32)
    admin_sessions[session_token] = admin.id

    return AdminLoginResponse(
        session_token=session_token,
        requires_password_change=admin.requires_password_change
    )


@router.post("/change-password")
def change_password(
    request: AdminChangePasswordRequest,
    token: str,
    db: Session = Depends(get_db)
):
    """Change admin password (on first login)"""
    if token not in admin_sessions:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    admin_id = admin_sessions[token]
    admin = db.query(Admin).filter(Admin.id == admin_id).first()

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin not found"
        )

    # Verify old password
    if not admin.verify_password(request.old_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Old password is incorrect"
        )

    # Set new password
    admin.set_password(request.new_password)
    admin.requires_password_change = False
    db.commit()

    return {"message": "Password changed successfully"}


@router.get("/verify")
def verify_token(token: str):
    """Verify if session token is valid"""
    if token in admin_sessions:
        return {"valid": True, "admin_id": admin_sessions[token]}
    return {"valid": False}


@router.post("/logout")
def logout(token: str):
    """Logout admin"""
    if token in admin_sessions:
        del admin_sessions[token]
    return {"message": "Logged out successfully"}
