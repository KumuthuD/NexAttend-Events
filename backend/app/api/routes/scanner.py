from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user, get_db
from app.schemas.scanner import ScanRequest, ScanResponse
from app.models.registration import get_registration_by_qr_code_id, mark_checked_in_atomically
from app.models.event import get_event_by_id
from bson import ObjectId
from app.api.websockets.manager import manager
import json

router = APIRouter()

@router.post("/check-in", response_model=ScanResponse)
async def scan_check_in(
    payload: ScanRequest, 
    db=Depends(get_db), 
    current_user=Depends(get_current_user)
):
    # Instead of reading and then writing, we do it atomically
    is_new_check_in, reg = await mark_checked_in_atomically(db, payload.qr_code_id)
    
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

    if not is_new_check_in:
        # Already checked in before this specific request
        return ScanResponse(
            status="already_checked_in",
            participant=participant,
            checked_in_at=reg.get("checked_in_at"),
            message=f"Already checked in at {reg.get('checked_in_at')}"
        )
    
    # It was just checked in uniquely by this request
    # Increment checked_in_count for event safely
    await db["events"].update_one(
        {"_id": ObjectId(event_id)}, 
        {"$inc": {"checked_in_count": 1}}
    )
    
    # Broadcast to live dashboard via WebSocket
    await manager.broadcast_to_event(str(event_id), {
        "type": "new_check_in",
        "registration_id": reg["id"],
        "participant_name": name,
        "checked_in_at": reg.get("checked_in_at").isoformat() if reg.get("checked_in_at") else None
    })
    
    return ScanResponse(
        status="checked_in",
        participant=participant,
        checked_in_at=reg.get("checked_in_at"),
        message=f"✓ {name} — Checked In"
    )

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
