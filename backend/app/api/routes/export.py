from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from app.api.deps import get_current_user, get_db
from app.models.event import get_event_by_id
from app.models.form_field import get_fields_by_event
from app.models.registration import get_registrations_by_event
from app.services.export_service import generate_csv, generate_excel
import urllib.parse

router = APIRouter()

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
    registrations = await get_registrations_by_event(db, event_id)
    
    if status == "checked_in":
        registrations = [r for r in registrations if r.get("checked_in")]
    elif status == "not_checked_in":
        registrations = [r for r in registrations if not r.get("checked_in")]
        
    if search:
        search = search.lower()
        registrations = [r for r in registrations if search in str(r.get("form_data", {})).lower()]
        
    csv_file = await generate_csv(registrations, fields)
    
    filename = f"{event['title']}_attendance.csv"
    encoded_filename = urllib.parse.quote(filename)
    
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
    registrations = await get_registrations_by_event(db, event_id)
    
    if status == "checked_in":
        registrations = [r for r in registrations if r.get("checked_in")]
    elif status == "not_checked_in":
        registrations = [r for r in registrations if not r.get("checked_in")]
        
    if search:
        search = search.lower()
        registrations = [r for r in registrations if search in str(r.get("form_data", {})).lower()]
        
    excel_file = await generate_excel(registrations, fields, event["title"])
    
    filename = f"{event['title']}_attendance.xlsx"
    encoded_filename = urllib.parse.quote(filename)
    
    return StreamingResponse(
        iter([excel_file.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"}
    )
