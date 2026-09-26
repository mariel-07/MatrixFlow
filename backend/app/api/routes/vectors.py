from fastapi import APIRouter, Depends, HTTPException, Request

from app.schemas.vector import VectorCreate, VectorResponse
from app.services.vector_service import (
    create_vector,
    delete_vector,
    get_vector_by_id,
    get_vectors,
    update_vector,
)
from app.services.audit_service import create_audit_log
from app.core.security import require_roles
from app.core.database import SessionLocal


router = APIRouter(prefix="/vectors", tags=["Vectors"])


@router.post("/", response_model=VectorResponse)
def create(
    data: VectorCreate,
    request: Request,
    current_user=Depends(require_roles("Administrador", "Analista")),
):
    vector = create_vector(data)

    db = SessionLocal()

    try:
        client_ip = request.client.host if request.client else None
        create_audit_log(
            db=db,
            action="CREATE",
            module="VECTORS",
            status="SUCCESS",
            result=f"Vector creado: {vector.name} (dim: {len(vector.values)})",
            user_id=int(current_user["sub"]),
            ip_address=client_ip,
        )
    finally:
        db.close()

    return vector


@router.get("/", response_model=list[VectorResponse])
def get_all(
    current_user=Depends(require_roles("Administrador", "Analista", "Consulta")),
):
    return get_vectors()


@router.get("/{vector_id}", response_model=VectorResponse)
def get_one(
    vector_id: int,
    current_user=Depends(require_roles("Administrador", "Analista", "Consulta")),
):
    vector = get_vector_by_id(vector_id)
    if not vector:
        raise HTTPException(status_code=404, detail="Vector no encontrado")
    return vector


@router.put("/{vector_id}", response_model=VectorResponse)
def update(
    vector_id: int,
    data: VectorCreate,
    request: Request,
    current_user=Depends(require_roles("Administrador", "Analista")),
):
    vector = update_vector(vector_id, data)
    if not vector:
        raise HTTPException(status_code=404, detail="Vector no encontrado")

    db = SessionLocal()
    try:
        client_ip = request.client.host if request.client else None
        create_audit_log(
            db=db,
            action="UPDATE",
            module="VECTORS",
            status="SUCCESS",
            result=f"Vector actualizado: {vector.name} (dim: {len(vector.values)})",
            user_id=int(current_user["sub"]),
            ip_address=client_ip,
        )
    finally:
        db.close()

    return vector


@router.delete("/{vector_id}")
def delete(
    vector_id: int,
    request: Request,
    current_user=Depends(require_roles("Administrador", "Analista")),
):
    success = delete_vector(vector_id)
    if not success:
        raise HTTPException(status_code=404, detail="Vector no encontrado")

    db = SessionLocal()
    try:
        client_ip = request.client.host if request.client else None
        create_audit_log(
            db=db,
            action="DELETE",
            module="VECTORS",
            status="SUCCESS",
            result=f"Vector eliminado: ID {vector_id}",
            user_id=int(current_user["sub"]),
            ip_address=client_ip,
        )
    finally:
        db.close()

    return {"message": "Vector eliminado correctamente", "id": vector_id}