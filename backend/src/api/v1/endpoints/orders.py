"""Orders endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models import Order, OrderItem, Book
from src.schemas.order import OrderCreate, OrderResponse, OrderItemCreate, OrderItemResponse, OrderCreateCheckout
from pydantic import BaseModel

router = APIRouter(prefix="/orders", tags=["orders"])


class BulkStatusUpdate(BaseModel):
    """Bulk status update schema"""
    order_ids: list[int]
    status: str


class BulkDeleteRequest(BaseModel):
    """Bulk delete schema"""
    order_ids: list[int]


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
async def create_order_checkout(order: OrderCreateCheckout, db: Session = Depends(get_db)):
    """Create a new order with items (checkout flow)"""

    # Validate all books exist and have sufficient stock
    books_data = {}

    for item in order.items:
        book = db.query(Book).filter(Book.id == item.book_id).first()
        if not book:
            raise HTTPException(
                status_code=404,
                detail=f"Book with ID {item.book_id} not found"
            )
        if book.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{book.title}'. Available: {book.stock}, Requested: {item.quantity}"
            )
        books_data[item.book_id] = (book, item.quantity)

    # Create order with total_price from frontend (includes VAT + shipping)
    db_order = Order(
        customer_name=order.customer_name,
        email=order.email,
        phone=order.phone,
        status="pending",
        total_price=order.total_price
    )
    db.add(db_order)
    db.flush()  # Get order ID without committing

    # Create order items and reduce stock
    for book_id, (book, quantity) in books_data.items():
        db_item = OrderItem(
            order_id=db_order.id,
            book_id=book_id,
            quantity=quantity,
            price_at_purchase=book.price
        )
        db.add(db_item)
        book.stock -= quantity

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


@router.put("/bulk-status", response_model=dict)
async def bulk_update_status(data: BulkStatusUpdate, db: Session = Depends(get_db)):
    """Update status for multiple orders"""
    if not data.order_ids:
        raise HTTPException(status_code=400, detail="No order IDs provided")

    if data.status not in ["pending", "done"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be 'pending' or 'done'")

    # Update all orders
    updated_count = db.query(Order).filter(Order.id.in_(data.order_ids)).update(
        {"status": data.status},
        synchronize_session=False
    )
    db.commit()

    return {"updated": updated_count, "status": data.status}


@router.delete("/bulk-delete", response_model=dict)
async def bulk_delete(data: BulkDeleteRequest, db: Session = Depends(get_db)):
    """Delete multiple orders and return items to stock"""
    if not data.order_ids:
        raise HTTPException(status_code=400, detail="No order IDs provided")

    # Get all order items for the orders being deleted
    order_items = db.query(OrderItem).filter(OrderItem.order_id.in_(data.order_ids)).all()

    # Return items to stock
    for item in order_items:
        book = db.query(Book).filter(Book.id == item.book_id).first()
        if book:
            book.stock += item.quantity

    # Delete orders (cascade will delete order items)
    deleted_count = db.query(Order).filter(Order.id.in_(data.order_ids)).delete(
        synchronize_session=False
    )
    db.commit()

    return {"deleted": deleted_count, "returned_items": len(order_items)}
