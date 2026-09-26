from fastapi import HTTPException, status
from pwdlib import PasswordHash

from app.schemas.auth import LoginRequest, LoginResponse, UserAuthInfo
from app.models.user import User
from app.core.database import SessionLocal
from app.core.security import create_access_token
from app.services.audit_service import create_audit_log


password_hash = PasswordHash.recommended()


def login(data: LoginRequest, ip_address: str | None = None) -> LoginResponse:
    db = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.username == data.username)
            .first()
        )

        if user is None:
            create_audit_log(
                db=db,
                action="LOGIN",
                module="AUTH",
                status="FAILED",
                result=f"Intento fallido de inicio de sesión: usuario '{data.username}' no encontrado",
                user_id=None,
                ip_address=ip_address,
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario o contraseña incorrectos",
            )

        if not password_hash.verify(data.password, user.password_hash):
            create_audit_log(
                db=db,
                action="LOGIN",
                module="AUTH",
                status="FAILED",
                result=f"Intento fallido de inicio de sesión: contraseña incorrecta para usuario '{data.username}'",
                user_id=user.id,
                ip_address=ip_address,
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario o contraseña incorrectos",
            )

        token = create_access_token(
            user_id=user.id,
            username=user.username,
            role=user.role.name,
        )

        create_audit_log(
            db=db,
            action="LOGIN",
            module="AUTH",
            status="SUCCESS",
            result=f"Inicio de sesión exitoso: {user.username} ({user.role.name})",
            user_id=user.id,
            ip_address=ip_address,
        )

        return LoginResponse(
            access_token=token,
            token_type="bearer",
            user=UserAuthInfo(
                id=user.id,
                username=user.username,
                email=user.email,
                role=user.role.name,
            ),
        )

    finally:
        db.close()
