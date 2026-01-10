from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.sql import func
from datetime import datetime, timezone
import hashlib
import secrets

from src.core.database import Base


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    requires_password_change = Column(Boolean, default=False)
    created_at = Column(Integer, default=lambda: int(datetime.now(timezone.utc).timestamp()))

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password with SHA256"""
        return hashlib.sha256(password.encode()).hexdigest()

    def set_password(self, password: str):
        """Set password hash"""
        self.password_hash = self.hash_password(password)

    def verify_password(self, password: str) -> bool:
        """Verify password"""
        return self.password_hash == self.hash_password(password)
