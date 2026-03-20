from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_db, get_current_user
from app.schemas.user import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse, UserUpdateRequest
from app.models.user import create_user, get_user_by_email, update_user, delete_user
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


@router.put("/me", response_model=UserResponse)
async def update_me(payload: UserUpdateRequest, current_user: dict = Depends(get_current_user), db=Depends(get_db)):
    """Update the currently authenticated user's profile."""
    update_data = payload.dict(exclude_unset=True)
    
    # Remove transient fields
    current_password = update_data.pop("current_password", None)
    
    # Hash password if provided
    if "password" in update_data:
        # Require current_password
        if not current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required to change password."
            )
            
        # Verify current password
        if not verify_password(current_password, current_user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password."
            )
            
        update_data["password_hash"] = hash_password(update_data.pop("password"))
        
    updated_user = await update_user(db, current_user["id"], update_data)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return UserResponse(
        id=updated_user["id"],
        name=updated_user["name"],
        email=updated_user["email"],
        organization=updated_user.get("organization"),
        role=updated_user.get("role"),
        created_at=updated_user.get("created_at"),
    )


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_me(current_user: dict = Depends(get_current_user), db=Depends(get_db)):
    """Delete the currently authenticated user's account."""
    success = await delete_user(db, current_user["id"])
    if not success:
        raise HTTPException(status_code=404, detail="Failed to delete user account.")
    return None
