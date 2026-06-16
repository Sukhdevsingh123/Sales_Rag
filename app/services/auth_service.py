from sqlalchemy.orm import Session
from app.core.models import User, UserRole
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.schemas import UserCreate, UserUpdate
from typing import Optional, List


class AuthService:
    """Service for authentication and user management."""

    @staticmethod
    def create_user(db: Session, user: UserCreate) -> User:
        """Create a new user."""
        db_user = User(
            email=user.email,
            full_name=user.full_name,
            hashed_password=get_password_hash(user.password),
            role=user.role
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email."""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        user = AuthService.get_user_by_email(db, email)
        
        if not user or not user.is_active:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
        
        return user

    @staticmethod
    def create_user_token(user: User) -> str:
        """Create JWT token for user."""
        return create_access_token(
            data={"sub": user.email, "role": user.role}
        )

    @staticmethod
    def get_all_users(db: Session) -> List[User]:
        """Get all users (admin only)."""
        return db.query(User).all()

    @staticmethod
    def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
        """Update user details (admin only)."""
        user = AuthService.get_user_by_id(db, user_id)
        
        if not user:
            return None
        
        if user_update.full_name is not None:
            user.full_name = user_update.full_name
        
        if user_update.role is not None:
            user.role = user_update.role
        
        if user_update.is_active is not None:
            user.is_active = user_update.is_active
        
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        """Delete user (admin only)."""
        user = AuthService.get_user_by_id(db, user_id)
        
        if not user:
            return False
        
        db.delete(user)
        db.commit()
        return True

    @staticmethod
    def user_exists(db: Session, email: str) -> bool:
        """Check if user exists."""
        return db.query(User).filter(User.email == email).first() is not None
