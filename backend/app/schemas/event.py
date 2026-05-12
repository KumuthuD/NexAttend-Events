from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class EventCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., max_length=1000)
    event_date: datetime
    event_end_date: Optional[datetime] = None
    location: str = Field(..., min_length=2, max_length=200)
    capacity: int = Field(..., ge=1, description="Capacity must be at least 1")
    category: str
    cover_image_url: Optional[str] = None
    gallery_images: Optional[List[str]] = []

class EventUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[datetime] = None
    event_end_date: Optional[datetime] = None
    location: Optional[str] = None
    capacity: Optional[int] = None
    category: Optional[str] = None
    cover_image_url: Optional[str] = None
    gallery_images: Optional[List[str]] = None

class EventStatusUpdate(BaseModel):
    status: str

class EventResponse(BaseModel):
    id: str
    creator_id: str
    title: str
    description: str
    slug: str
    event_date: datetime
    event_end_date: Optional[datetime] = None
    location: str
    capacity: int
    status: str
    category: str
    cover_image_url: Optional[str] = None
    gallery_images: Optional[List[str]] = []
    registration_count: int
    checked_in_count: int
    created_at: datetime
    updated_at: datetime

class EventListResponse(BaseModel):
    events: List[EventResponse]
    total: int

class EventPublicResponse(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    event_date: datetime
    location: str
    capacity: int
    registration_count: int
    cover_image_url: Optional[str] = None
    gallery_images: Optional[List[str]] = []
    category: str
