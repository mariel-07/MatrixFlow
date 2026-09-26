from pwdlib import PasswordHash

from app.schemas.user import UserCreate, UserResponse
from app.models.user import User
from app.core.database import SessionLocal


password_hash = PasswordHash.recommended()


def create_user(data: UserCreate) -> UserResponse:
    db = SessionLocal()

    try:
        hashed_password = password_hash.hash(data.password)

        user = User(
            username=data.username,
            email=data.email,
            password_hash=hashed_password,
            role_id=data.role_id,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            role_id=user.role_id,
            role_name=user.role.name if user.role else None,
        )

    finally:
        db.close()


def get_users() -> list[UserResponse]:
    db = SessionLocal()

    try:
        users = db.query(User).all()

        return [
            UserResponse(
                id=user.id,
                username=user.username,
                email=user.email,
                role_id=user.role_id,
                role_name=user.role.name if user.role else None,
            )
            for user in users
        ]

    finally:
        db.close()
