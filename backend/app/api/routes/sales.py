from fastapi import APIRouter, Depends, HTTPException, Request

from app.schemas.sale import SaleCreate, SaleResponse
from app.services.sale_service import create_sale, delete_sale, get_sales
from app.services.audit_service import create_audit_log
from app.core.security import require_roles
from app.core.database import SessionLocal


router = APIRouter(prefix="/sales", tags=["Sales"])


@router.post("/", response_model=SaleResponse)
def create(
    data: SaleCreate,
    request: Request,
    current_user=Depends(require_roles("Administrador", "Analista")),
):
    sale = create_sale(data)

    db = SessionLocal()

    try:
        client_ip = request.client.host if request.client else None
        create_audit_log(
            db=db,
            action="CREATE",
            module="SALES",
            status="SUCCESS",
            result=f"Venta creada: ID {sale.id} - Total: S/ {sale.total}",
            user_id=int(current_user["sub"]),
            ip_address=client_ip,
        )
    finally:
        db.close()

    return sale


@router.get("/", response_model=list[SaleResponse])
def get_all(
    current_user=Depends(require_roles("Administrador", "Analista", "Consulta")),
):
    return get_sales()


@router.delete("/{sale_id}")
def delete(
    sale_id: int,
    request: Request,
    current_user=Depends(require_roles("Administrador", "Analista")),
):
    success = delete_sale(sale_id)
    if not success:
        raise HTTPException(status_code=404, detail="Venta no encontrada")

    db = SessionLocal()
    try:
        client_ip = request.client.host if request.client else None
        create_audit_log(
            db=db,
            action="DELETE",
            module="SALES",
            status="SUCCESS",
            result=f"Venta eliminada: ID {sale_id}",
            user_id=int(current_user["sub"]),
            ip_address=client_ip,
        )
    finally:
        db.close()

    return {"message": "Venta eliminada correctamente", "id": sale_id}