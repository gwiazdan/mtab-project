"""Orders endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models import Order, OrderItem, Book
from src.schemas.order import OrderCreate, OrderResponse, OrderItemCreate, OrderItemResponse

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/", response_model=list[OrderResponse])
async def list_orders(db: Session = Depends(get_db)):
    """Get all orders"""
    orders = db.query(Order).all()
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get order by ID with items"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/", response_model=OrderResponse, status_code=201)
async def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order"""
    db_order = Order(
        customer_name=order.customer_name,
        email=order.email,
        phone=order.phone,
        status=order.status,
        total_price=0.0
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


@router.post("/items", response_model=OrderItemResponse, status_code=201)
async def add_order_item(item: OrderItemCreate, db: Session = Depends(get_db)):
    """Add item to order"""

    order = db.query(Order).filter(Order.id == item.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    book = db.query(Book).filter(Book.id == item.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    db_item = OrderItem(
        order_id=item.order_id,
        book_id=item.book_id,
        quantity=item.quantity,
        price_at_purchase=book.price
    )
    db.add(db_item)

    order.total_price += book.price * item.quantity

    db.commit()
    db.refresh(db_item)
    return db_item

