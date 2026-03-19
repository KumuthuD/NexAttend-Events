from datetime import datetime, timezone
from bson import ObjectId


async def create_user(db, user_data: dict) -> dict:
    """Insert a new user document into the users collection."""
    now = datetime.now(timezone.utc)
    user_data["created_at"] = now
    user_data["updated_at"] = now
    user_data["role"] = "event_manager"

    result = await db["users"].insert_one(user_data)
    created_user = await db["users"].find_one({"_id": result.inserted_id})
    created_user["id"] = str(created_user.pop("_id"))
    return created_user


async def get_user_by_email(db, email: str) -> dict | None:
    """Find a user by their email address."""
    user = await db["users"].find_one({"email": email})
    if user:
        user["id"] = str(user.pop("_id"))
    return user


async def get_user_by_id(db, user_id: str) -> dict | None:
    """Find a user by their ObjectId (as string)."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        return None
    user = await db["users"].find_one({"_id": oid})
    if user:
        user["id"] = str(user.pop("_id"))
    return user
