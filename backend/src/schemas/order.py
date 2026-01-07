"""Order schemas"""
from pydantic import BaseModel, Field, ConfigDict


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
    items: list[OrderItemResponse] = []

