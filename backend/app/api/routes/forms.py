from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from bson.errors import InvalidId

from app.api.deps import get_db, get_current_user
from app.schemas.form_field import (
    FormFieldCreateRequest,
    FormFieldUpdateRequest,
    FormFieldReorderRequest,
    FormFieldResponse,
)
from app.models.form_field import (
    create_field,
    get_fields_by_event,
    get_field_by_id,
    update_field,
    delete_field,
)

router = APIRouter()


def _validate_oid(oid: str) -> None:
    """Raise 404 if the string is not a valid ObjectId."""
    try:
        ObjectId(oid)
    except (InvalidId, Exception):
        raise HTTPException(status_code=404, detail="Invalid ID format")


async def _verify_event_owner(db, event_id: str, current_user: dict) -> dict:
    """Return the event document if the current user is the creator, else raise 403."""
    _validate_oid(event_id)
    event = await db["events"].find_one({"_id": ObjectId(event_id)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if str(event["creator_id"]) != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorised to modify this event's fields")
    return event


# ---------------------------------------------------------------------------
# GET /events/{event_id}/fields  — public (participants need this to render the form)
# ---------------------------------------------------------------------------
@router.get("/events/{event_id}/fields", response_model=list[FormFieldResponse])
async def list_form_fields(event_id: str, db=Depends(get_db)):
    _validate_oid(event_id)
    # Verify event exists
    event = await db["events"].find_one({"_id": ObjectId(event_id)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    fields = await get_fields_by_event(db, event_id)
    return fields


# ---------------------------------------------------------------------------
# POST /events/{event_id}/fields  — auth required
# ---------------------------------------------------------------------------
@router.post("/events/{event_id}/fields", response_model=FormFieldResponse, status_code=status.HTTP_201_CREATED)
async def add_form_field(
    event_id: str,
    body: FormFieldCreateRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    await _verify_event_owner(db, event_id, current_user)

    if body.field_type not in {"text", "email", "number", "phone", "dropdown", "checkbox", "textarea"}:
        raise HTTPException(status_code=400, detail=f"Invalid field_type: '{body.field_type}'")

    if body.field_type == "dropdown" and not body.options:
        raise HTTPException(status_code=400, detail="Dropdown fields must have at least one option")

    field = await create_field(db, event_id, body.model_dump())
    # Normalise _id → id for response
    if "_id" in field:
        field["id"] = str(field.pop("_id"))
    field["event_id"] = str(field["event_id"]) if not isinstance(field["event_id"], str) else field["event_id"]
    return field


# ---------------------------------------------------------------------------
# PUT /events/{event_id}/fields/{field_id}  — auth required
# ---------------------------------------------------------------------------
@router.put("/events/{event_id}/fields/{field_id}", response_model=FormFieldResponse)
async def update_form_field(
    event_id: str,
    field_id: str,
    body: FormFieldUpdateRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    await _verify_event_owner(db, event_id, current_user)
    _validate_oid(field_id)

    # Check field belongs to this event
    field = await db["form_fields"].find_one({"_id": ObjectId(field_id), "event_id": ObjectId(event_id)})
    if not field:
        raise HTTPException(status_code=404, detail="Form field not found")

    if body.field_type and body.field_type not in {"text", "email", "number", "phone", "dropdown", "checkbox", "textarea"}:
        raise HTTPException(status_code=400, detail=f"Invalid field_type: '{body.field_type}'")

    updated = await update_field(db, field_id, body.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Form field not found")
    return updated


# ---------------------------------------------------------------------------
# DELETE /events/{event_id}/fields/{field_id}  — auth required
# ---------------------------------------------------------------------------
@router.delete("/events/{event_id}/fields/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_form_field(
    event_id: str,
    field_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    await _verify_event_owner(db, event_id, current_user)
    _validate_oid(field_id)

    # Check field belongs to this event
    field = await db["form_fields"].find_one({"_id": ObjectId(field_id), "event_id": ObjectId(event_id)})
    if not field:
        raise HTTPException(status_code=404, detail="Form field not found")

    deleted = await delete_field(db, field_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Form field not found")


# ---------------------------------------------------------------------------
# PUT /events/{event_id}/fields/reorder  — auth required
# ---------------------------------------------------------------------------
@router.put("/events/{event_id}/fields/reorder", response_model=list[FormFieldResponse])
async def reorder_form_fields(
    event_id: str,
    body: FormFieldReorderRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    await _verify_event_owner(db, event_id, current_user)

    # Bulk update each field's order
    for item in body.fields:
        _validate_oid(item.id)
        await db["form_fields"].update_one(
            {"_id": ObjectId(item.id), "event_id": ObjectId(event_id)},
            {"$set": {"order": item.order}}
        )

    return await get_fields_by_event(db, event_id)
