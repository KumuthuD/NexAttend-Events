import re
import string
import random
from datetime import datetime, timezone
from bson import ObjectId

def generate_slug(title: str) -> str:
    """Generate a URL-friendly slug from a title."""
    slug = title.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    slug = slug.strip('-')
    
    # Add random suffix for uniqueness
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
    return f"{slug}-{suffix}"

async def create_event(db, event_data: dict) -> dict:
    """Insert a new event document."""
    now = datetime.now(timezone.utc)
    event_data["created_at"] = now
    event_data["updated_at"] = now
    event_data["registration_count"] = 0
    event_data["checked_in_count"] = 0
    
    if "slug" not in event_data or not event_data["slug"]:
        event_data["slug"] = generate_slug(event_data["title"])
        
    result = await db["events"].insert_one(event_data)
    created_event = await db["events"].find_one({"_id": result.inserted_id})
    created_event["id"] = str(created_event.pop("_id"))
    return created_event

async def get_events_by_creator(db, creator_id: str) -> list:
    """Fetch all events created by a specific user."""
    cursor = db["events"].find({"creator_id": ObjectId(creator_id)})
    events = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        events.append(doc)
    return events

async def get_event_by_id(db, event_id: str) -> dict | None:
    """Fetch a single event by ID."""
    try:
        oid = ObjectId(event_id)
    except Exception:
        return None
    doc = await db["events"].find_one({"_id": oid})
    if doc:
        doc["id"] = str(doc.pop("_id"))
    return doc

async def get_event_by_slug(db, slug: str) -> dict | None:
    """Fetch a single event by slug."""
    doc = await db["events"].find_one({"slug": slug})
    if doc:
        doc["id"] = str(doc.pop("_id"))
    return doc

async def update_event(db, event_id: str, update_data: dict) -> dict | None:
    """Update event and return updated document."""
    update_data["updated_at"] = datetime.now(timezone.utc)
    try:
        oid = ObjectId(event_id)
    except Exception:
        return None
        
    result = await db["events"].find_one_and_update(
        {"_id": oid},
        {"$set": update_data},
        return_document=True
    )
    if result:
        result["id"] = str(result.pop("_id"))
    return result

async def delete_event(db, event_id: str) -> bool:
    """Delete event by ID."""
    try:
        oid = ObjectId(event_id)
    except Exception:
        return False
    result = await db["events"].delete_one({"_id": oid})
    return result.deleted_count > 0
