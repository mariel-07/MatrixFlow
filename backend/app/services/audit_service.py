from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    action: str,
    module: str,
    status: str,
    result: str | None = None,
    user_id: int | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        module=module,
        ip_address=ip_address,
        status=status,
        result=result,
    )

    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)

    return audit_log