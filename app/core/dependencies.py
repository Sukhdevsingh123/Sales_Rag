from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.core.models import User, UserRole
from app.services.auth_service import AuthService

security = HTTPBearer()


async def get_current_user(
    credentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token."""
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user = AuthService.get_user_by_email(db, email)
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return user


async def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Require user to be admin."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


async def require_admin_or_test(
    current_user: User = Depends(get_current_user)
) -> User:
    """Require user to be admin or test role (for development)."""
    if current_user.role not in [UserRole.ADMIN, UserRole.TEST]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Test access required"
        )
    return current_user


async def require_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Require user to be authenticated (any role)."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive"
        )
    return current_user