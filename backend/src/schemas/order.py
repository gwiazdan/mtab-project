"""Order schemas"""
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_serializer
from datetime import datetime


class BookMinimal(BaseModel):
    """Minimal book info for order items"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    price: float


class OrderItemCreate(BaseModel):
    """Order item creation schema"""
    order_id: int
    book_id: int
    quantity: int = Field(gt=0)


class OrderItemResponse(BaseModel):
    """Order item response schema"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    book_id: int
    quantity: int
    price_at_purchase: float
    book: BookMinimal


class OrderItemCheckout(BaseModel):
    """Order item during checkout"""
    book_id: int
    quantity: int = Field(gt=0)


class OrderCreateCheckout(BaseModel):
    """Order creation schema with items (checkout flow)"""
    customer_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: str | None = Field(None, max_length=20)
    total_price: float = Field(gt=0)
    items: list[OrderItemCheckout] = Field(min_length=1)


class OrderCreate(BaseModel):
    """Order creation schema"""
    customer_name: str
    email: str
    phone: str | None = None
    status: str = "pending"


class OrderResponse(BaseModel):
    """Order response schema"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_name: str
    email: str
    phone: str | None = None
    status: str
    total_price: float
    created_at: datetime
    items: list[OrderItemResponse] = []

    @field_serializer('created_at')
    def serialize_created_at(self, value: datetime) -> str:
        """Serialize datetime to ISO format with Z suffix for UTC"""
        if value.tzinfo is None:
            # If naive datetime, assume UTC
            value = value.replace(tzinfo=None)
        return value.isoformat() + 'Z'

