from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    organization: Optional[str] = None


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
    current_password: Optional[str] = None
    organization: Optional[str] = None



class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    organization: Optional[str] = None
    role: Optional[str] = None
    created_at: Optional[datetime] = None


class TokenResponse(BaseModel):
    id: str
    name: str
    email: str
    token: str
