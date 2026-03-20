from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from bson import ObjectId
from bson.errors import InvalidId

from app.api.deps import get_db, get_current_user
from app.schemas.registration import (
    RegistrationCreateRequest,
    RegistrationResponse,
    RegistrationDetailResponse,
    RegistrationListResponse,
)
from app.models.registration import (
    create_registration,
    get_registrations_by_event,
    get_registration_by_qr_code_id,
    check_duplicate,
)
from app.services.qr_service import generate_qr_code_id, generate_qr_image
from app.services.email_service import send_registration_email

router = APIRouter()


async def _background_send_registration_email(
    to_email: str,
    participant_name: str,
    event_title: str,
    event_date: str,
    qr_code_id: str,
    qr_code_base64: str,
    registration_id: str,
    db
):
    """
    Background task to send registration email and update registration status.
    Uses try/except to ensure failures don't crash the background worker.
    """
    try:
        # Format the date if it's a datetime object
        if hasattr(event_date, "strftime"):
            event_date = event_date.strftime("%B %d, %Y, %I:%M %p")

        success = send_registration_email(
            to_email, participant_name, event_title, event_date, qr_code_id, qr_code_base64
        )

        if success:
            await db["registrations"].update_one(
                {"_id": ObjectId(registration_id)},
                {"$set": {"qr_emailed": True}}
            )
    except Exception as e:
        print(f"FAILED to send background email: {str(e)}")


def _validate_oid(oid: str) -> None:
    try:
        ObjectId(oid)
    except (InvalidId, Exception):
        raise HTTPException(status_code=404, detail="Invalid ID format")


# ---------------------------------------------------------------------------
# POST /registrations  — public (participants register for events)
# ---------------------------------------------------------------------------
@router.post("/registrations", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_for_event(
    body: RegistrationCreateRequest,
    background_tasks: BackgroundTasks,
    db=Depends(get_db),
):
    _validate_oid(body.event_id)

    # 1. Validate event exists and is published
    event = await db["events"].find_one({"_id": ObjectId(body.event_id)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.get("status") not in ("published", "ongoing"):
        raise HTTPException(status_code=400, detail="This event is not accepting registrations")

    # 2. Check capacity (0 = unlimited)
    capacity = event.get("capacity", 0)
    registration_count = event.get("registration_count", 0)
    if capacity > 0 and registration_count >= capacity:
        raise HTTPException(status_code=400, detail="This event has reached full capacity")

    # 3. Extract email from form_data and check for duplicate
    email = (
        body.form_data.get("email")
        or body.form_data.get("Email")
        or ""
    ).strip().lower()

    if not email:
        raise HTTPException(status_code=400, detail="Email is required in form_data")

    is_duplicate = await check_duplicate(db, body.event_id, email)
    if is_duplicate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You are already registered for this event"
        )

    # 4. Create registration document (with a temp placeholder qr_code_id)
    doc = await create_registration(db, body.event_id, body.form_data, qr_code_id="")

    # 5. Generate QR code ID using actual ObjectIds
    registration_id = str(doc["_id"])
    qr_code_id = generate_qr_code_id(body.event_id, registration_id)

    # Update the registration with the real qr_code_id
    await db["registrations"].update_one(
        {"_id": doc["_id"]},
        {"$set": {"qr_code_id": qr_code_id}}
    )
    doc["qr_code_id"] = qr_code_id

    # 6. Generate QR code image (base64 PNG)
    qr_code_base64 = generate_qr_image(qr_code_id)

    # 7. Increment event's registration_count atomically
    await db["events"].update_one(
        {"_id": ObjectId(body.event_id)},
        {"$inc": {"registration_count": 1}}
    )

    # 8. Trigger email in background (Task 3.3)
    participant_name = (
        body.form_data.get("Full Name")
        or body.form_data.get("name")
        or body.form_data.get("Name")
        or "Participant"
    )

    background_tasks.add_task(
        _background_send_registration_email,
        to_email=email,
        participant_name=participant_name,
        event_title=event.get("title", ""),
        event_date=event.get("event_date"),
        qr_code_id=qr_code_id,
        qr_code_base64=qr_code_base64,
        registration_id=registration_id,
        db=db
    )

    return RegistrationResponse(
        id=registration_id,
        qr_code_id=qr_code_id,
        qr_code_base64=qr_code_base64,
        event_title=event.get("title", ""),
        registered_at=doc["registered_at"],
    )


# ---------------------------------------------------------------------------
# GET /events/{event_id}/registrations  — auth required (event manager)
# ---------------------------------------------------------------------------
@router.get("/events/{event_id}/registrations", response_model=RegistrationListResponse)
async def list_registrations(
    event_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    _validate_oid(event_id)

    # Verify event exists and belongs to the current user
    event = await db["events"].find_one({"_id": ObjectId(event_id)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if str(event["creator_id"]) != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorised to view registrations for this event")

    registrations = await get_registrations_by_event(db, event_id)

    detail_list = [
        RegistrationDetailResponse(
            id=reg["id"],
            event_id=reg["event_id"],
            qr_code_id=reg["qr_code_id"],
            form_data=reg["form_data"],
            email=reg["email"],
            checked_in=reg["checked_in"],
            checked_in_at=reg.get("checked_in_at"),
            checked_out=reg.get("checked_out", False),
            checked_out_at=reg.get("checked_out_at"),
            qr_emailed=reg.get("qr_emailed", False),
            registered_at=reg["registered_at"],
        )
        for reg in registrations
    ]

    return RegistrationListResponse(registrations=detail_list, total=len(detail_list))


# ---------------------------------------------------------------------------
# GET /registrations/{qr_code_id}  — public (QR verification / success page)
# ---------------------------------------------------------------------------
@router.get("/registrations/{qr_code_id}", response_model=RegistrationDetailResponse)
async def get_registration_by_qr(
    qr_code_id: str,
    db=Depends(get_db),
):
    reg = await get_registration_by_qr_code_id(db, qr_code_id)
    if not reg:
        raise HTTPException(status_code=404, detail="No registration found for this QR code")

    return RegistrationDetailResponse(
        id=reg["id"],
        event_id=reg["event_id"],
        qr_code_id=reg["qr_code_id"],
        form_data=reg["form_data"],
        email=reg["email"],
        checked_in=reg["checked_in"],
        checked_in_at=reg.get("checked_in_at"),
        checked_out=reg.get("checked_out", False),
        checked_out_at=reg.get("checked_out_at"),
        qr_emailed=reg.get("qr_emailed", False),
        registered_at=reg["registered_at"],
    )
