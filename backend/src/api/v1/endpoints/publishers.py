"""Publishers endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models import Publisher
from src.schemas.publisher import PublisherCreate, PublisherResponse

router = APIRouter(prefix="/publishers", tags=["publishers"])


@router.get("/", response_model=list[PublisherResponse])
async def list_publishers(db: Session = Depends(get_db)):
    """Get all publishers"""
    publishers = db.query(Publisher).all()
    return publishers


@router.get("/{publisher_id}", response_model=PublisherResponse)
async def get_publisher(publisher_id: int, db: Session = Depends(get_db)):
    """Get publisher by ID"""
    publisher = db.query(Publisher).filter(Publisher.id == publisher_id).first()
    if not publisher:
        raise HTTPException(status_code=404, detail="Publisher not found")
    return publisher


@router.post("/", response_model=PublisherResponse, status_code=201)
async def create_publisher(publisher: PublisherCreate, db: Session = Depends(get_db)):
    """Create a new publisher"""
    db_publisher = Publisher(
        name=publisher.name,
        address=publisher.address,
        contact=publisher.contact
    )
    db.add(db_publisher)
    db.commit()
    db.refresh(db_publisher)
    return db_publisher
