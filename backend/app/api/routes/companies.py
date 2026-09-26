from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_roles
from app.schemas.company import CompanyCreate, CompanyResponse
from app.services.company_service import (
    create_company,
    get_companies,
    get_company_by_id,
    update_company,
)
from app.services.audit_service import create_audit_log

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.get("/", response_model=list[CompanyResponse])
def get_all(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrador", "Analista", "Consulta")),
):
    return get_companies(db)


@router.get("/{company_id}", response_model=CompanyResponse)
def get_one(
    company_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrador", "Analista", "Consulta")),
):
    company = get_company_by_id(db, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return company


@router.post("/", response_model=CompanyResponse)
def create(
    data: CompanyCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrador")),
):
    company = create_company(db, data)

    client_ip = request.client.host if request.client else None
    create_audit_log(
        db=db,
        action="CREATE",
        module="COMPANIES",
        status="SUCCESS",
        result=f"Empresa creada: {company.name} (ID: {company.id})",
        user_id=int(current_user["sub"]),
        ip_address=client_ip,
    )

    return company


@router.put("/{company_id}", response_model=CompanyResponse)
def update(
    company_id: int,
    data: CompanyCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrador")),
):
    company = update_company(db, company_id, data)

    client_ip = request.client.host if request.client else None
    create_audit_log(
        db=db,
        action="UPDATE",
        module="COMPANIES",
        status="SUCCESS",
        result=f"Empresa actualizada: {company.name} (ID: {company.id})",
        user_id=int(current_user["sub"]),
        ip_address=client_ip,
    )

    return company



