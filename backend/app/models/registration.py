from datetime import datetime, timezone
import random
from bson import ObjectId


async def create_registration(db, event_id: str, form_data: dict, qr_code_id: str) -> dict:
    now = datetime.now(timezone.utc)

    # Extract email from form_data for quick lookup / duplicate check
    email = (
        form_data.get("email")
        or form_data.get("Email")
        or ""
    ).strip().lower()

    # Generate a unique 6-digit participant_id
    while True:
        participant_id = random.randint(100000, 999999)
        existing = await db["registrations"].find_one({"participant_id": participant_id})
        if not existing:
            break

    doc = {
        "event_id": ObjectId(event_id),
        "qr_code_id": qr_code_id,
        "participant_id": participant_id,
        "form_data": form_data,
        "email": email,
        "checked_in": False,
        "checked_in_at": None,
        "checked_out": False,
        "checked_out_at": None,
        "qr_emailed": False,
        "registered_at": now,
    }
    result = await db["registrations"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def get_registrations_by_event(db, event_id: str) -> list:
    cursor = db["registrations"].find({"event_id": ObjectId(event_id)}).sort("registered_at", -1)
    registrations = []
    async for reg in cursor:
        reg["id"] = str(reg.pop("_id"))
        reg["event_id"] = str(reg["event_id"])
        registrations.append(reg)
    return registrations


async def get_registration_by_qr_code_id(db, qr_code_id: str) -> dict | None:
    reg = await db["registrations"].find_one({"qr_code_id": qr_code_id})
    if reg:
        reg["id"] = str(reg.pop("_id"))
        reg["event_id"] = str(reg["event_id"])
    return reg


from pymongo import ReturnDocument

async def mark_checked_in_atomically(db, qr_code_id: str) -> tuple[bool, dict | None]:
    now = datetime.now(timezone.utc)
    
    # Try to update only if it hasn't been checked in yet (atomic)
    updated_reg = await db["registrations"].find_one_and_update(
        {"qr_code_id": qr_code_id, "checked_in": False},
        {"$set": {"checked_in": True, "checked_in_at": now}},
        return_document=ReturnDocument.AFTER
    )
    
    if updated_reg:
        updated_reg["id"] = str(updated_reg.pop("_id"))
        updated_reg["event_id"] = str(updated_reg["event_id"])
        # True means it was uniquely checked in just now
        return True, updated_reg
        
    # If find_one_and_update returned None, it either doesn't exist or is already checked in
    reg = await get_registration_by_qr_code_id(db, qr_code_id)
    return False, reg

async def check_duplicate(db, event_id: str, email: str) -> bool:
    """Returns True if the email is already registered for the given event."""
    existing = await db["registrations"].find_one({
        "event_id": ObjectId(event_id),
        "email": email.strip().lower()
    })
    return existing is not None
