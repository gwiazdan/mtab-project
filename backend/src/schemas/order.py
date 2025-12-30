"""Order schemas"""
from pydantic import BaseModel, Field


class BookMinimal(BaseModel):
    """Minimal book info for order items"""
    id: int
    title: str
    price: float

    class Config:
        from_attributes = True


class OrderItemCreate(BaseModel):
    """Order item creation schema"""
    order_id: int
    book_id: int
    quantity: int = Field(gt=0)


class OrderItemResponse(BaseModel):
    """Order item response schema"""
    id: int
    order_id: int
    book_id: int
    quantity: int
    price_at_purchase: float
    book: BookMinimal

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    """Order creation schema"""
    customer_name: str
    email: str
    phone: str | None = None
    status: str = "pending"


class OrderResponse(BaseModel):
    """Order response schema"""
    id: int
    customer_name: str
    email: str
    phone: str | None = None
    status: str
    total_price: float
    items: list[OrderItemResponse] = []

    class Config:
        from_attributes = True

