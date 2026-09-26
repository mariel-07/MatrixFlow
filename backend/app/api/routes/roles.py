from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import require_roles
from app.models.role import Role


class RoleResponse(BaseModel):
    id: int
    name: str


router = APIRouter(prefix="/roles", tags=["Roles"])


@router.get("/", response_model=list[RoleResponse])
def get_roles(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrador")),
):
    roles = db.query(Role).all()
    return [RoleResponse(id=role.id, name=role.name) for role in roles]

