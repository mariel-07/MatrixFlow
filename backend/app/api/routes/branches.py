from fastapi import APIRouter, Depends, HTTPException, Request

from app.schemas.branch import BranchCreate, BranchResponse
from app.services.branch_service import (
    create_branch,
    delete_branch,
    get_branch_by_id,
    get_branches,
    update_branch,
)
from app.services.audit_service import create_audit_log
from app.core.security import require_roles
from app.core.database import SessionLocal


router = APIRouter(prefix="/branches", tags=["Branches"])


@router.post("/", response_model=BranchResponse)
def create(
    data: BranchCreate,
    request: Request,
    current_user=Depends(require_roles("Administrador")),
):
    branch = create_branch(data)

    db = SessionLocal()

    try:
        client_ip = request.client.host if request.client else None
        create_audit_log(
            db=db,
            action="CREATE",
            module="BRANCHES",
            status="SUCCESS",
            result=f"Sucursal creada: {branch.name} (ID: {branch.id})",
            user_id=int(current_user["sub"]),
            ip_address=client_ip,
        )
    finally:
        db.close()

    return branch


@router.get("/", response_model=list[BranchResponse])
def get_all(
    current_user=Depends(require_roles("Administrador", "Analista", "Consulta")),
):
    return get_branches()


@router.get("/{branch_id}", response_model=BranchResponse)
def get_one(
    branch_id: int,
    current_user=Depends(require_roles("Administrador", "Analista", "Consulta")),
):
    branch = get_branch_by_id(branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    return branch


@router.put("/{branch_id}", response_model=BranchResponse)
def update(
    branch_id: int,
    data: BranchCreate,
    request: Request,
    current_user=Depends(require_roles("Administrador")),
):
    branch = update_branch(branch_id, data)
    if not branch:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")

    db = SessionLocal()
    try:
        client_ip = request.client.host if request.client else None
        create_audit_log(
            db=db,
            action="UPDATE",
            module="BRANCHES",
            status="SUCCESS",
            result=f"Sucursal actualizada: {branch.name} (ID: {branch.id})",
            user_id=int(current_user["sub"]),
            ip_address=client_ip,
        )
    finally:
        db.close()

    return branch


@router.delete("/{branch_id}")
def delete(
    branch_id: int,
    request: Request,
    current_user=Depends(require_roles("Administrador")),
):
    success = delete_branch(branch_id)
    if not success:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")

    db = SessionLocal()
    try:
        client_ip = request.client.host if request.client else None
        create_audit_log(
            db=db,
            action="DELETE",
            module="BRANCHES",
            status="SUCCESS",
            result=f"Sucursal eliminada: ID {branch_id}",
            user_id=int(current_user["sub"]),
            ip_address=client_ip,
        )
    finally:
        db.close()

    return {"message": "Sucursal eliminada correctamente", "id": branch_id}

