from fastapi import APIRouter, Depends, Request

from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import create_user, get_users
from app.services.audit_service import create_audit_log
from app.core.security import require_roles
from app.core.database import SessionLocal

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserResponse)
def create(
    data: UserCreate,
    request: Request,
    current_user=Depends(require_roles("Administrador")),
):
    user = create_user(data)

    db = SessionLocal()
    try:
        client_ip = request.client.host if request.client else None
        create_audit_log(
            db=db,
            action="CREATE",
            module="USERS",
            status="SUCCESS",
            result=f"Usuario creado: {user.username} (Rol: {user.role_name or user.role_id})",
            user_id=int(current_user["sub"]),
            ip_address=client_ip,
        )
    finally:
        db.close()

    return user


@router.get("/", response_model=list[UserResponse])
def get_all(
    current_user=Depends(require_roles("Administrador")),
):
    return get_users()
