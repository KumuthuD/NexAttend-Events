"""
Event model helpers.

NOTE: Full event CRUD is implemented in Task 2.2 (Thisandu: Events API).
      This file provides the helpers that Task 2.3 (forms/registrations) depends on.
      When Task 2.2 is merged, any overlapping helpers here should be removed in favour
      of those in the events route / service.
"""
from datetime import datetime, timezone
from bson import ObjectId
import re
import random
import string


def _generate_slug(title: str) -> str:
    """Convert a title to a URL-friendly slug."""
    slug = title.lower().strip()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s-]+", "-", slug)
    slug = slug.strip("-")
    return slug


async def _slug_is_unique(db, slug: str) -> bool:
    existing = await db["events"].find_one({"slug": slug})
    return existing is None


async def generate_unique_slug(db, title: str) -> str:
    base_slug = _generate_slug(title)
    slug = base_slug
    while not await _slug_is_unique(db, slug):
        suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=4))
        slug = f"{base_slug}-{suffix}"
    return slug


async def get_event_by_id(db, event_id: str) -> dict | None:
    event = await db["events"].find_one({"_id": ObjectId(event_id)})
    if event:
        event["id"] = str(event.pop("_id"))
        event["creator_id"] = str(event["creator_id"])
    return event
