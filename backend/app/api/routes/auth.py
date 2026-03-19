from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_db, get_current_user
from app.schemas.user import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from app.models.user import create_user, get_user_by_email
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegisterRequest, db=Depends(get_db)):
    """Register a new event manager account."""
    # Check if email already exists
    existing = await get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    # Hash password before storing
    user_data = {
        "name": payload.name,
        "email": payload.email,
        "password_hash": hash_password(payload.password),
        "organization": payload.organization,
    }

    user = await create_user(db, user_data)

    # Generate JWT (subject = email)
    token = create_access_token({"sub": user["email"]})

    return TokenResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        token=token,
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLoginRequest, db=Depends(get_db)):
    """Login with email and password, returns JWT token."""
    user = await get_user_by_email(db, payload.email)

    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": user["email"]})

    return TokenResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        token=token,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        organization=current_user.get("organization"),
        role=current_user.get("role"),
        created_at=current_user.get("created_at"),
    )
