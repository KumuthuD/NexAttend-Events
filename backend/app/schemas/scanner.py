from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class ScanRequest(BaseModel):
    qr_code_id: str

class ScanResponse(BaseModel):
    status: str
    participant: Dict[str, Any]
    checked_in_at: Optional[datetime] = None
    message: str
    new_total_count: Optional[int] = None
