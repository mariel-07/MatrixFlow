from fastapi import APIRouter, Depends, HTTPException, Request

from app.schemas.product import ProductCreate, ProductResponse
from app.services.product_service import (
    create_product,
    delete_product,
    get_product_by_id,
    get_products,
    update_product,
)
from app.services.audit_service import create_audit_log
from app.core.security import require_roles
from app.core.database import SessionLocal


router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/", response_model=ProductResponse)
def create(
    data: ProductCreate,
    request: Request,
    current_user=Depends(require_roles("Administrador")),
):
    product = create_product(data)

    db = SessionLocal()

    try:
        client_ip = request.client.host if request.client else None
        create_audit_log(
            db=db,
            action="CREATE",
            module="PRODUCTS",
            status="SUCCESS",
            result=f"Producto creado: {product.name} (ID: {product.id})",
            user_id=int(current_user["sub"]),
            ip_address=client_ip,
        )
    finally:
        db.close()

    return product


@router.get("/", response_model=list[ProductResponse])
def get_all(
    current_user=Depends(require_roles("Administrador", "Analista", "Consulta")),
):
    return get_products()


@router.get("/{product_id}", response_model=ProductResponse)
def get_one(
    product_id: int,
    current_user=Depends(require_roles("Administrador", "Analista", "Consulta")),
):
    product = get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update(
    product_id: int,
    data: ProductCreate,
    request: Request,
    current_user=Depends(require_roles("Administrador")),
):
    product = update_product(product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    db = SessionLocal()
    try:
        client_ip = request.client.host if request.client else None
        create_audit_log(
            db=db,
            action="UPDATE",
            module="PRODUCTS",
            status="SUCCESS",
            result=f"Producto actualizado: {product.name} (ID: {product.id})",
            user_id=int(current_user["sub"]),
            ip_address=client_ip,
        )
    finally:
        db.close()

    return product


@router.delete("/{product_id}")
def delete(
    product_id: int,
    request: Request,
    current_user=Depends(require_roles("Administrador")),
):
    success = delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    db = SessionLocal()
    try:
        client_ip = request.client.host if request.client else None
        create_audit_log(
            db=db,
            action="DELETE",
            module="PRODUCTS",
            status="SUCCESS",
            result=f"Producto eliminado: ID {product_id}",
            user_id=int(current_user["sub"]),
            ip_address=client_ip,
        )
    finally:
        db.close()

    return {"message": "Producto eliminado correctamente", "id": product_id}

