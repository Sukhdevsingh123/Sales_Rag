#!/usr/bin/env python3
"""
Database initialization script to create tables and seed initial admin user.
Run this after setting up the database URL in .env

Usage:
    python init_db.py
"""

import sys
from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.core.models import Base, UserRole
from app.services.auth_service import AuthService
from app.core.schemas import UserCreate


def init_db():
    """Initialize database tables and create admin user."""
    
    # Create tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully")
    
    # Create initial admin user
    db: Session = SessionLocal()
    try:
        # Check if admin already exists
        admin_email = "admin@example.com"
        if AuthService.user_exists(db, admin_email):
            print(f"✓ Admin user '{admin_email}' already exists")
        else:
            print("\nCreating initial admin user...")
            admin_user = UserCreate(
                email=admin_email,
                full_name="Admin User",
                password="admin123",  # Change this in production!
                role=UserRole.ADMIN
            )
            created_admin = AuthService.create_user(db, admin_user)
            print(f"✓ Admin user created: {created_admin.email}")
            print(f"  Email: {admin_email}")
            print(f"  Default Password: admin123")
            print("  ⚠️  Please change this password immediately!")
        
        # Create test user
        test_email = "test@example.com"
        if AuthService.user_exists(db, test_email):
            print(f"✓ Test user '{test_email}' already exists")
        else:
            print("\nCreating test user...")
            test_user = UserCreate(
                email=test_email,
                full_name="Test User",
                password="test123",
                role=UserRole.TEST
            )
            created_test = AuthService.create_user(db, test_user)
            print(f"✓ Test user created: {created_test.email}")
        
        # Create regular user
        user_email = "user@example.com"
        if AuthService.user_exists(db, user_email):
            print(f"✓ Regular user '{user_email}' already exists")
        else:
            print("\nCreating regular user...")
            regular_user = UserCreate(
                email=user_email,
                full_name="Regular User",
                password="user123",
                role=UserRole.USER
            )
            created_user = AuthService.create_user(db, regular_user)
            print(f"✓ Regular user created: {created_user.email}")
        
        print("\n✓ Database initialization complete!")
        print("\nYou can now login with:")
        print("  Admin: admin@example.com / admin123")
        print("  Test: test@example.com / test123")
        print("  User: user@example.com / user123")
        
    except Exception as e:
        print(f"✗ Error initializing database: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
