from sqlalchemy.orm import Session

from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyResponse


def create_company(
    db: Session,
    data: CompanyCreate,
) -> CompanyResponse:

    company = Company(
        name=data.name,
        description=data.description,
    )

    db.add(company)
    db.commit()
    db.refresh(company)

    return CompanyResponse(
        id=company.id,
        name=company.name,
        description=company.description,
    )


def get_companies(db: Session) -> list[CompanyResponse]:
    companies = db.query(Company).all()
    return [
        CompanyResponse(
            id=company.id,
            name=company.name,
            description=company.description,
        )
        for company in companies
    ]


def get_company_by_id(db: Session, company_id: int) -> CompanyResponse | None:
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        return None
    return CompanyResponse(
        id=company.id,
        name=company.name,
        description=company.description,
    )



def update_company(
    db: Session,
    company_id: int,
    data: CompanyCreate,
) -> CompanyResponse:
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        company = Company(id=company_id, name=data.name, description=data.description)
        db.add(company)
    else:
        company.name = data.name
        company.description = data.description

    db.commit()
    db.refresh(company)

    return CompanyResponse(
        id=company.id,
        name=company.name,
        description=company.description,
    )