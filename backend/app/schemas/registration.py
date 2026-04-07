from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from datetime import datetime


class RegistrationCreateRequest(BaseModel):
    event_id: str
    form_data: Dict[str, Any]


class RegistrationResponse(BaseModel):
    id: str
    qr_code_id: str
    participant_id: int
    qr_code_base64: str
    event_title: str
    registered_at: datetime


class RegistrationDetailResponse(BaseModel):
    id: str
    event_id: str
    qr_code_id: str
    participant_id: int
    form_data: Dict[str, Any]
    email: str
    checked_in: bool
    checked_in_at: Optional[datetime] = None
    checked_out: bool
    checked_out_at: Optional[datetime] = None
    qr_emailed: bool
    registered_at: datetime


class RegistrationListResponse(BaseModel):
    registrations: List[RegistrationDetailResponse]
    total: int
