from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: str | None = None
    price: float = Field(..., ge=0)


class ProductCreate(ProductBase):
    category_id: int | None = None


class ProductResponse(ProductBase):
    id: int
    category_id: int | None = None