from datetime import datetime, timezone
from bson import ObjectId


async def create_field(db, event_id: str, data: dict) -> dict:
    now = datetime.now(timezone.utc)
    doc = {
        "event_id": ObjectId(event_id),
        "label": data["label"],
        "field_type": data["field_type"],
        "placeholder": data.get("placeholder", ""),
        "required": data.get("required", False),
        "order": data.get("order", 1),
        "options": data.get("options", []),
        "created_at": now,
    }
    result = await db["form_fields"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def get_fields_by_event(db, event_id: str) -> list:
    cursor = db["form_fields"].find(
        {"event_id": ObjectId(event_id)}
    ).sort("order", 1)
    fields = []
    async for field in cursor:
        field["id"] = str(field.pop("_id"))
        field["event_id"] = str(field["event_id"])
        fields.append(field)
    return fields


async def get_field_by_id(db, field_id: str) -> dict | None:
    field = await db["form_fields"].find_one({"_id": ObjectId(field_id)})
    if field:
        field["id"] = str(field.pop("_id"))
        field["event_id"] = str(field["event_id"])
    return field


async def update_field(db, field_id: str, data: dict) -> dict | None:
    update_data = {k: v for k, v in data.items() if v is not None}
    if not update_data:
        return await get_field_by_id(db, field_id)
    await db["form_fields"].update_one(
        {"_id": ObjectId(field_id)},
        {"$set": update_data}
    )
    return await get_field_by_id(db, field_id)


async def delete_field(db, field_id: str) -> bool:
    result = await db["form_fields"].delete_one({"_id": ObjectId(field_id)})
    return result.deleted_count == 1


async def create_default_fields(db, event_id: str) -> list:
    defaults = [
        {"label": "Full Name", "field_type": "text", "placeholder": "Enter your full name", "required": True, "order": 1, "options": []},
        {"label": "Email", "field_type": "email", "placeholder": "Enter your email address", "required": True, "order": 2, "options": []},
        {"label": "Phone Number", "field_type": "phone", "placeholder": "Enter your phone number", "required": True, "order": 3, "options": []},
    ]
    created = []
    for field_data in defaults:
        field = await create_field(db, event_id, field_data)
        field["id"] = str(field.pop("_id")) if "_id" in field else field.get("id", "")
        field["event_id"] = str(field.get("event_id", event_id))
        created.append(field)
    return created
