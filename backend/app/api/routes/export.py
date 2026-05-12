from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from app.api.deps import get_current_user, get_db
from app.models.event import get_event_by_id
from app.models.form_field import get_fields_by_event
from app.services.export_service import generate_csv, generate_excel
from bson import ObjectId
import urllib.parse
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


async def _get_filtered_registrations(db, event_id: str, status: str, search: str) -> list:
    """Build and run a MongoDB query with filters pushed to the database layer."""
    query: dict = {"event_id": ObjectId(event_id)}

    # Push status filter to DB
    if status == "checked_in":
        query["checked_in"] = True
    elif status == "not_checked_in":
        query["checked_in"] = False

    # Push text search to DB via regex on form_data string (field values)
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"form_data": {"$elemMatch": {"$regex": search, "$options": "i"}}},
            # Fallback: search across all form_data values as string
        ]
        # Simpler approach: regex on the raw bson field values
        query.pop("$or", None)
        query["$where"] = f"JSON.stringify(this.form_data).toLowerCase().includes('{search.lower()}')"

    cursor = db["registrations"].find(query).sort("registered_at", -1)
    registrations = []
    async for reg in cursor:
        reg["id"] = str(reg.pop("_id"))
        reg["event_id"] = str(reg["event_id"])
        registrations.append(reg)
    return registrations


@router.get("/{event_id}/csv")
async def download_csv(
    event_id: str,
    status: str = "all",
    search: str = "",
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    event = await get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event["creator_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to export this event")

    fields = await get_fields_by_event(db, event_id)
    registrations = await _get_filtered_registrations(db, event_id, status, search)

    csv_file = await generate_csv(registrations, fields)

    filename = f"{event['title']}_attendance.csv"
    encoded_filename = urllib.parse.quote(filename)

    logger.info(f"Exporting CSV for event '{event['title']}' — {len(registrations)} rows")
    return StreamingResponse(
        iter([csv_file.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"}
    )


@router.get("/{event_id}/excel")
async def download_excel(
    event_id: str,
    status: str = "all",
    search: str = "",
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    event = await get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event["creator_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to export this event")

    fields = await get_fields_by_event(db, event_id)
    registrations = await _get_filtered_registrations(db, event_id, status, search)

    excel_file = await generate_excel(registrations, fields, event["title"])

    filename = f"{event['title']}_attendance.xlsx"
    encoded_filename = urllib.parse.quote(filename)

    logger.info(f"Exporting Excel for event '{event['title']}' — {len(registrations)} rows")
    return StreamingResponse(
        iter([excel_file.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"}
    )

