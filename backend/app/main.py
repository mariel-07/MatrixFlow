from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
import app.models

from app.core.config import settings

from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.companies import router as companies_router
from app.api.routes.branches import router as branches_router
from app.api.routes.products import router as products_router
from app.api.routes.sales import router as sales_router
from app.api.routes.inventory import router as inventory_router
from app.api.routes.vectors import router as vectors_router
from app.api.routes.matrices import router as matrices_router
from app.api.routes.operations import router as operations_router
from app.api.routes.reports import router as reports_router
from app.api.routes.roles import router as roles_router
from app.api.routes.audit_logs import router as audit_logs_router


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API backend para MatrixFlow Enterprise",
    debug=settings.DEBUG,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    auth_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    users_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    companies_router,
    prefix=settings.API_V1_PREFIX,
)


app.include_router(
    branches_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    products_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    sales_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    inventory_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    vectors_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    matrices_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    operations_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    reports_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    roles_router,
    prefix=settings.API_V1_PREFIX,
)

app.include_router(
    audit_logs_router,
    prefix=settings.API_V1_PREFIX,
)



Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {
        "message": settings.APP_NAME,
        "status": "online",
        "version": settings.APP_VERSION,
    }