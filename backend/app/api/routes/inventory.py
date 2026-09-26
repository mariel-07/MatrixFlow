from fastapi import APIRouter, Depends, HTTPException, Request

from app.schemas.inventory import InventoryCreate, InventoryResponse
from app.services.inventory_service import create_inventory, delete_inventory, get_inventory
from app.services.audit_service import create_audit_log
from app.core.security import require_roles
from app.core.database import SessionLocal


router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.post("/", response_model=InventoryResponse)
def create(
    data: InventoryCreate,
    request: Request,
    current_user=Depends(require_roles("Administrador", "Analista")),
):
    inventory = create_inventory(data)

    db = SessionLocal()

    try:
        client_ip = request.client.host if request.client else None
        create_audit_log(
            db=db,
            action="CREATE",
            module="INVENTORY",
            status="SUCCESS",
            result=f"Inventario registrado: ID {inventory.id} - Producto: {inventory.product_id} - Stock: {inventory.quantity}",
            user_id=int(current_user["sub"]),
            ip_address=client_ip,
        )
    finally:
        db.close()

    return inventory


@router.get("/", response_model=list[InventoryResponse])
def get_all(
    current_user=Depends(require_roles("Administrador", "Analista", "Consulta")),
):
    return get_inventory()


@router.delete("/{inventory_id}")
def delete(
    inventory_id: int,
    request: Request,
    current_user=Depends(require_roles("Administrador", "Analista")),
):
    success = delete_inventory(inventory_id)
    if not success:
        raise HTTPException(status_code=404, detail="Registro de inventario no encontrado")

    db = SessionLocal()
    try:
        client_ip = request.client.host if request.client else None
        create_audit_log(
            db=db,
            action="DELETE",
            module="INVENTORY",
            status="SUCCESS",
            result=f"Inventario eliminado: ID {inventory_id}",
            user_id=int(current_user["sub"]),
            ip_address=client_ip,
        )
    finally:
        db.close()

    return {"message": "Registro de inventario eliminado correctamente", "id": inventory_id}