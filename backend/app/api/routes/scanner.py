from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user, get_db
from app.schemas.scanner import ScanRequest, ScanResponse
from app.models.registration import get_registration_by_qr_code_id, mark_checked_in
from app.models.event import get_event_by_id
from bson import ObjectId

router = APIRouter()

@router.post("/check-in", response_model=ScanResponse)
async def scan_check_in(
    payload: ScanRequest, 
    db=Depends(get_db), 
    current_user=Depends(get_current_user)
):
    reg = await get_registration_by_qr_code_id(db, payload.qr_code_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="No registration found for this QR code"
        )
    
    event_id = reg["event_id"]
    event = await get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    participant = reg.get("form_data", {})
    name = participant.get("full_name", participant.get("Full Name", "Participant"))

    if reg.get("checked_in"):
        return ScanResponse(
            status="already_checked_in",
            participant=participant,
            checked_in_at=reg.get("checked_in_at"),
            message=f"Already checked in at {reg.get('checked_in_at')}"
        )
    
    updated_reg = await mark_checked_in(db, payload.qr_code_id)
    if updated_reg:
        # Increment checked_in_count for event
        await db["events"].update_one(
            {"_id": ObjectId(event_id)}, 
            {"$inc": {"checked_in_count": 1}}
        )
        return ScanResponse(
            status="checked_in",
            participant=participant,
            checked_in_at=updated_reg.get("checked_in_at"),
            message=f"✓ {name} — Checked In"
        )
    
    raise HTTPException(status_code=500, detail="Failed to mark check-in")

@router.get("/verify/{qr_code_id}")
async def verify_registration(
    qr_code_id: str, 
    db=Depends(get_db), 
    current_user=Depends(get_current_user)
):
    reg = await get_registration_by_qr_code_id(db, qr_code_id)
    if not reg:
        raise HTTPException(status_code=404, detail="No registration found")
    
    participant = reg.get("form_data", {})
    name = participant.get("full_name", participant.get("Full Name", "Participant"))
    
    return {
        "status": "valid",
        "checked_in": reg.get("checked_in"),
        "checked_in_at": reg.get("checked_in_at"),
        "participant": participant,
        "message": f"{name} is registered"
    }
