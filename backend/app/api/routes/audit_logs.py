from datetime import datetime
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_roles
from app.models.audit_log import AuditLog
from app.models.user import User


class AuditLogResponse(BaseModel):
    id: int
    user_id: int | None = None
    username: str | None = None
    action: str
    module: str
    ip_address: str | None = None
    status: str
    result: str | None = None
    created_at: datetime


router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])


@router.get("/", response_model=list[AuditLogResponse])
def get_audit_logs(
    module: str | None = Query(None, description="Filtrar por módulo"),
    action: str | None = Query(None, description="Filtrar por acción"),
    status: str | None = Query(None, description="Filtrar por estado"),
    limit: int = Query(100, ge=1, le=500, description="Límite de registros"),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrador", "Analista")),
):
    query = (
        db.query(
            AuditLog.id,
            AuditLog.user_id,
            User.username.label("username"),
            AuditLog.action,
            AuditLog.module,
            AuditLog.ip_address,
            AuditLog.status,
            AuditLog.result,
            AuditLog.created_at,
        )
        .outerjoin(User, User.id == AuditLog.user_id)
        .order_by(AuditLog.created_at.desc())
    )

    if module:
        query = query.filter(AuditLog.module == module.upper())

    if action:
        query = query.filter(AuditLog.action == action.upper())

    if status:
        query = query.filter(AuditLog.status == status.upper())

    records = query.limit(limit).all()

    return [
        AuditLogResponse(
            id=r.id,
            user_id=r.user_id,
            username=r.username or "Sistema",
            action=r.action,
            module=r.module,
            ip_address=r.ip_address or "127.0.0.1",
            status=r.status,
            result=r.result,
            created_at=r.created_at,
        )
        for r in records
    ]

