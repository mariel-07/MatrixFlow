from fastapi import APIRouter, Depends, HTTPException, Request

from app.schemas.operation import OperationCreate, OperationResponse
from app.services.operation_service import create_operation, get_operations
from app.services.audit_service import create_audit_log
from app.core.security import require_roles
from app.core.database import SessionLocal


router = APIRouter(prefix="/operations", tags=["Operations"])


@router.post("/", response_model=OperationResponse)
def create(
    data: OperationCreate,
    request: Request,
    current_user=Depends(require_roles("Administrador", "Analista")),
):
    try:
        operation = create_operation(data)

        db = SessionLocal()

        try:
            client_ip = request.client.host if request.client else None
            create_audit_log(
                db=db,
                action="CALCULATION",
                module="OPERATIONS",
                status="SUCCESS",
                result=f"Cálculo ejecutado: {operation.operation_type} (ID: {operation.id})",
                user_id=int(current_user["sub"]),
                ip_address=client_ip,
            )
        finally:
            db.close()

        return operation

    except ValueError as error:
        db = SessionLocal()
        try:
            client_ip = request.client.host if request.client else None
            create_audit_log(
                db=db,
                action="CALCULATION",
                module="OPERATIONS",
                status="FAILED",
                result=f"Error en cálculo {data.operation_type}: {str(error)}",
                user_id=int(current_user["sub"]),
                ip_address=client_ip,
            )
        finally:
            db.close()

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.get("/", response_model=list[OperationResponse])
def get_all(
    current_user=Depends(require_roles("Administrador", "Analista", "Consulta")),
):
    return get_operations()