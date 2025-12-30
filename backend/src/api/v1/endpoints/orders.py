"""Orders endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models import Order

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/")
async def list_orders(db: Session = Depends(get_db)):
    """Get all orders"""
    orders = db.query(Order).all()
    return orders


@router.get("/{order_id}")
async def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get order by ID with items"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
