from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from bson import ObjectId
from app.api.deps import get_db, get_current_user
from app.schemas.event import (
    EventCreateRequest, 
    EventUpdateRequest, 
    EventResponse, 
    EventListResponse, 
    EventPublicResponse,
    EventStatusUpdate
)
from app.models.event import (
    create_event, 
    get_events_by_creator, 
    get_event_by_id, 
    get_event_by_slug, 
    update_event, 
    delete_event
)

router = APIRouter()

@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_new_event(payload: EventCreateRequest, current_user=Depends(get_current_user), db=Depends(get_db)):
    """Create a new event. Defaults to draft status."""
    event_data = payload.dict()
    event_data["creator_id"] = ObjectId(current_user["id"])
    event_data["status"] = "draft"
    
    event = await create_event(db, event_data)
    # Ensure creator_id is string for response
    event["creator_id"] = str(event["creator_id"])
    return event

@router.get("/", response_model=EventListResponse)
async def list_my_events(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Get all events created by the logged-in user."""
    events = await get_events_by_creator(db, current_user["id"])
    # Convert creator_id to string for each event
    for event in events:
        event["creator_id"] = str(event["creator_id"])
    return {"events": events, "total": len(events)}

@router.get("/public/discover")
async def discover_events(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db=Depends(get_db)
):
    """Search for published events."""
    query = {"status": "published"}
    if search:
        query["title"] = {"$regex": search, "$options": "i"}
    if category and category.lower() != "all":
        query["category"] = category
        
    cursor = db["events"].find(query)
    events = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        events.append(doc)
    return {"events": events, "total": len(events)}

@router.get("/public/{slug}", response_model=EventPublicResponse)
async def get_public_event(slug: str, db=Depends(get_db)):
    """Get event details by slug for public registration page."""
    event = await get_event_by_slug(db, slug)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.get("/{id}", response_model=EventResponse)
async def get_single_event(id: str, current_user=Depends(get_current_user), db=Depends(get_db)):
    """Get full event details. Must be the creator."""
    event = await get_event_by_id(db, id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event["creator_id"] != ObjectId(current_user["id"]):
        raise HTTPException(status_code=403, detail="Not authorized to view this event")
    
    event["creator_id"] = str(event["creator_id"])
    return event

@router.put("/{id}", response_model=EventResponse)
async def update_event_details(
    id: str, 
    payload: EventUpdateRequest, 
    current_user=Depends(get_current_user), 
    db=Depends(get_db)
):
    """Update event details. Must be the creator."""
    event = await get_event_by_id(db, id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event["creator_id"] != ObjectId(current_user["id"]):
        raise HTTPException(status_code=403, detail="Not authorized to update this event")
    
    update_data = payload.dict(exclude_unset=True)
    updated_event = await update_event(db, id, update_data)
    updated_event["creator_id"] = str(updated_event["creator_id"])
    return updated_event

@router.patch("/{id}/status", response_model=EventResponse)
async def update_event_status_route(
    id: str, 
    payload: EventStatusUpdate, 
    current_user=Depends(get_current_user), 
    db=Depends(get_db)
):
    """Update event status (draft, published, etc.). Must be the creator."""
    event = await get_event_by_id(db, id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event["creator_id"] != ObjectId(current_user["id"]):
        raise HTTPException(status_code=403, detail="Not authorized to update this event")
    
    updated_event = await update_event(db, id, {"status": payload.status})
    updated_event["creator_id"] = str(updated_event["creator_id"])
    return updated_event

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event_route(id: str, current_user=Depends(get_current_user), db=Depends(get_db)):
    """Delete an event. Must be the creator."""
    event = await get_event_by_id(db, id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event["creator_id"] != ObjectId(current_user["id"]):
        raise HTTPException(status_code=403, detail="Not authorized to delete this event")
    
    await delete_event(db, id)
    return None
