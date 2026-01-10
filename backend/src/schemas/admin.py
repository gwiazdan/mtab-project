from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class AdminLoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1)


class AdminChangePasswordRequest(BaseModel):
    old_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=1)


class AdminLoginResponse(BaseModel):
    session_token: str
    requires_password_change: bool


class AdminResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
