
from app.schemas.branch import BranchCreate, BranchResponse
from app.models.branch import Branch
from app.core.database import SessionLocal


def create_branch(data: BranchCreate) -> BranchResponse:
    db = SessionLocal()

    try:
        branch = Branch(
            name=data.name,
            location=data.location,
            company_id=data.company_id,
        )

        db.add(branch)
        db.commit()
        db.refresh(branch)

        return BranchResponse(
            id=branch.id,
            name=branch.name,
            location=branch.location,
            company_id=branch.company_id,
        )

    finally:
        db.close()


def get_branches() -> list[BranchResponse]:
    db = SessionLocal()

    try:
        branches = db.query(Branch).all()

        return [
            BranchResponse(
                id=branch.id,
                name=branch.name,
                location=branch.location,
                company_id=branch.company_id,
            )
            for branch in branches
        ]

    finally:
        db.close()



def get_branch_by_id(branch_id: int) -> BranchResponse | None:
    db = SessionLocal()
    try:
        branch = db.query(Branch).filter(Branch.id == branch_id).first()
        if not branch:
            return None
        return BranchResponse(
            id=branch.id,
            name=branch.name,
            location=branch.location,
            company_id=branch.company_id,
        )
    finally:
        db.close()


def update_branch(branch_id: int, data: BranchCreate) -> BranchResponse | None:
    db = SessionLocal()
    try:
        branch = db.query(Branch).filter(Branch.id == branch_id).first()
        if not branch:
            return None
        branch.name = data.name
        branch.location = data.location
        branch.company_id = data.company_id
        db.commit()
        db.refresh(branch)
        return BranchResponse(
            id=branch.id,
            name=branch.name,
            location=branch.location,
            company_id=branch.company_id,
        )
    finally:
        db.close()


def delete_branch(branch_id: int) -> bool:
    db = SessionLocal()
    try:
        branch = db.query(Branch).filter(Branch.id == branch_id).first()
        if not branch:
            return False
        db.delete(branch)
        db.commit()
        return True
    finally:
        db.close()


