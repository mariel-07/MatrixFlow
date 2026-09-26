from pydantic import BaseModel, Field


class InventoryBase(BaseModel):
    product_id: int
    branch_id: int
    quantity: float = Field(..., ge=0)


class InventoryCreate(InventoryBase):
    pass


class InventoryResponse(InventoryBase):
    id: int
    product_name: str | None = None
    branch_name: str | None = None