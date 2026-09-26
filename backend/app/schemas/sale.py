from pydantic import BaseModel, Field


class SaleDetail(BaseModel):
    product_id: int
    quantity: float = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)


class SaleCreate(BaseModel):
    branch_id: int
    details: list[SaleDetail] = Field(..., min_length=1)


class SaleDetailResponse(BaseModel):
    id: int | None = None
    product_id: int
    product_name: str | None = None
    quantity: float
    unit_price: float


class SaleResponse(BaseModel):
    id: int
    branch_id: int
    branch_name: str | None = None
    total: float
    details: list[SaleDetailResponse] = []