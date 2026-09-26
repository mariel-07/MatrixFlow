from fastapi import APIRouter, Depends, Request

from app.schemas.auth import LoginRequest, LoginResponse, UserAuthInfo
from app.services.auth_service import login
from app.core.security import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=LoginResponse)
def authenticate(data: LoginRequest, request: Request):
    client_ip = request.client.host if request.client else None
    return login(data, ip_address=client_ip)


@router.get("/me", response_model=UserAuthInfo)
def get_me(current_user=Depends(get_current_user)):
    return UserAuthInfo(
        id=int(current_user["sub"]),
        username=current_user["username"],
        email=f"{current_user['username']}@matrixflow.com",
        role=current_user["role"],
    )

