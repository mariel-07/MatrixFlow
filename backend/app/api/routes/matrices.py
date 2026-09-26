from fastapi import APIRouter, Depends, HTTPException, Request

from app.schemas.matrix import MatrixCreate, MatrixResponse
from app.services.matrix_service import (
    create_matrix,
    delete_matrix,
    get_matrices,
    get_matrix_by_id,
    update_matrix,
)
from app.services.audit_service import create_audit_log
from app.core.security import require_roles
from app.core.database import SessionLocal


router = APIRouter(prefix="/matrices", tags=["Matrices"])


@router.post("/", response_model=MatrixResponse)
def create(
    data: MatrixCreate,
    request: Request,
    current_user=Depends(require_roles("Administrador", "Analista")),
):
    matrix = create_matrix(data)

    db = SessionLocal()

    try:
        client_ip = request.client.host if request.client else None
        create_audit_log(
            db=db,
            action="CREATE",
            module="MATRICES",
            status="SUCCESS",
            result=f"Matriz creada: {matrix.name} ({matrix.rows}x{matrix.columns})",
            user_id=int(current_user["sub"]),
            ip_address=client_ip,
        )
    finally:
        db.close()

    return matrix


@router.get("/", response_model=list[MatrixResponse])
def get_all(
    current_user=Depends(require_roles("Administrador", "Analista", "Consulta")),
):
    return get_matrices()


@router.get("/{matrix_id}", response_model=MatrixResponse)
def get_one(
    matrix_id: int,
    current_user=Depends(require_roles("Administrador", "Analista", "Consulta")),
):
    matrix = get_matrix_by_id(matrix_id)
    if not matrix:
        raise HTTPException(status_code=404, detail="Matriz no encontrada")
    return matrix


@router.put("/{matrix_id}", response_model=MatrixResponse)
def update(
    matrix_id: int,
    data: MatrixCreate,
    request: Request,
    current_user=Depends(require_roles("Administrador", "Analista")),
):
    matrix = update_matrix(matrix_id, data)
    if not matrix:
        raise HTTPException(status_code=404, detail="Matriz no encontrada")

    db = SessionLocal()
    try:
        client_ip = request.client.host if request.client else None
        create_audit_log(
            db=db,
            action="UPDATE",
            module="MATRICES",
            status="SUCCESS",
            result=f"Matriz actualizada: {matrix.name} ({matrix.rows}x{matrix.columns})",
            user_id=int(current_user["sub"]),
            ip_address=client_ip,
        )
    finally:
        db.close()

    return matrix


@router.delete("/{matrix_id}")
def delete(
    matrix_id: int,
    request: Request,
    current_user=Depends(require_roles("Administrador", "Analista")),
):
    success = delete_matrix(matrix_id)
    if not success:
        raise HTTPException(status_code=404, detail="Matriz no encontrada")

    db = SessionLocal()
    try:
        client_ip = request.client.host if request.client else None
        create_audit_log(
            db=db,
            action="DELETE",
            module="MATRICES",
            status="SUCCESS",
            result=f"Matriz eliminada: ID {matrix_id}",
            user_id=int(current_user["sub"]),
            ip_address=client_ip,
        )
    finally:
        db.close()

    return {"message": "Matriz eliminada correctamente", "id": matrix_id}