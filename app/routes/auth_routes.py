from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.schemas import (
    LoginRequest,
    LoginResponse,
    UserCreate,
    UserResponse,
    UserUpdate
)
from app.core.dependencies import require_admin, require_user
from app.core.models import User, UserRole
from app.services.auth_service import AuthService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login with email and password."""
    user = AuthService.authenticate_user(db, request.email, request.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token = AuthService.create_user_token(user)
    
    return LoginResponse(
        access_token=token,
        user=UserResponse.from_orm(user)
    )


@router.post("/users", response_model=UserResponse, dependencies=[Depends(require_admin)])
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new user (admin only)."""
    if AuthService.user_exists(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user = AuthService.create_user(db, user_data)
    return UserResponse.from_orm(user)


@router.get("/users", response_model=list[UserResponse], dependencies=[Depends(require_admin)])
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all users (admin only)."""
    users = AuthService.get_all_users(db)
    return [UserResponse.from_orm(u) for u in users]


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(require_user)
):
    """Get current user info."""
    return UserResponse.from_orm(current_user)


@router.put("/users/{user_id}", response_model=UserResponse, dependencies=[Depends(require_admin)])
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update user details (admin only)."""
    if user_id == current_user.id and user_update.is_active is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    user = AuthService.update_user(db, user_id, user_update)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse.from_orm(user)


@router.delete("/users/{user_id}", dependencies=[Depends(require_admin)])
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete user (admin only)."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    success = AuthService.delete_user(db, user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User deleted successfully"}
