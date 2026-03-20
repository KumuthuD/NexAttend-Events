from pydantic import BaseModel, EmailStr, Field

class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=50)
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
