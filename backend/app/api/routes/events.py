from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from bson import ObjectId
from datetime import datetime, timezone
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
    return event

@router.get("/", response_model=EventListResponse)
async def list_my_events(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Get all events created by the logged-in user. Auto-transitions past events to 'completed'."""
    events = await get_events_by_creator(db, current_user["id"])
    now = datetime.now(timezone.utc)

    for event in events:
        # Auto-transition published/ongoing events to 'completed' if their date has passed
        if event.get("status") in ("published", "ongoing"):
            event_date_raw = event.get("event_date")
            if event_date_raw:
                event_date = event_date_raw.replace(tzinfo=timezone.utc) if (isinstance(event_date_raw, datetime) and event_date_raw.tzinfo is None) else event_date_raw
                if event_date and event_date < now:
                    await db["events"].update_one(
                        {"_id": ObjectId(event["id"])},
                        {"$set": {"status": "completed", "updated_at": now}}
                    )
                    event["status"] = "completed"

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
        if "creator_id" in doc:
            doc["creator_id"] = str(doc["creator_id"])
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
    if event["creator_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this event")
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
    if event["creator_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this event")

    update_data = payload.dict(exclude_unset=True)
    updated_event = await update_event(db, id, update_data)
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
    if event["creator_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this event")

    updated_event = await update_event(db, id, {"status": payload.status})
    return updated_event

@router.post("/{id}/duplicate", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def duplicate_event(
    id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Duplicate an existing event as a new draft, including all its form fields."""
    event = await get_event_by_id(db, id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event["creator_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to duplicate this event")

    # Build a new event data dict from the original (strip metadata fields)
    new_event_data = {
        k: v for k, v in event.items()
        if k not in ("id", "_id", "slug", "created_at", "updated_at", "registration_count", "checked_in_count")
    }
    new_event_data["title"] = f"Copy of {event['title']}"
    new_event_data["status"] = "draft"
    new_event_data["creator_id"] = ObjectId(current_user["id"])

    new_event = await create_event(db, new_event_data)
    new_event_id = ObjectId(new_event["id"])

    # Duplicate form fields from original event
    from app.models.form_field import get_fields_by_event
    original_fields = await get_fields_by_event(db, id)
    if original_fields:
        now = datetime.now(timezone.utc)
        new_fields = []
        for field in original_fields:
            field_copy = {k: v for k, v in field.items() if k not in ("id", "_id", "event_id")}
            field_copy["event_id"] = new_event_id
            field_copy["created_at"] = now
            new_fields.append(field_copy)

        # Remove auto-created default fields first, then re-insert from original
        await db["form_fields"].delete_many({"event_id": new_event_id})
        if new_fields:
            await db["form_fields"].insert_many(new_fields)

    return new_event

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event_route(id: str, current_user=Depends(get_current_user), db=Depends(get_db)):
    """Delete an event and all its registrations + form fields. Must be the creator."""
    event = await get_event_by_id(db, id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event["creator_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this event")
    
    await delete_event(db, id)
    return None

