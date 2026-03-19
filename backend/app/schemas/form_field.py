from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

VALID_FIELD_TYPES = {"text", "email", "number", "phone", "dropdown", "checkbox", "textarea"}


class FormFieldCreateRequest(BaseModel):
    label: str
    field_type: str
    placeholder: Optional[str] = ""
    required: Optional[bool] = False
    order: Optional[int] = 1
    options: Optional[List[str]] = []


class FormFieldUpdateRequest(BaseModel):
    label: Optional[str] = None
    field_type: Optional[str] = None
    placeholder: Optional[str] = None
    required: Optional[bool] = None
    order: Optional[int] = None
    options: Optional[List[str]] = None


class FormFieldReorderItem(BaseModel):
    id: str
    order: int


class FormFieldReorderRequest(BaseModel):
    fields: List[FormFieldReorderItem]


class FormFieldResponse(BaseModel):
    id: str
    event_id: str
    label: str
    field_type: str
    placeholder: str
    required: bool
    order: int
    options: List[str]
    created_at: datetime
