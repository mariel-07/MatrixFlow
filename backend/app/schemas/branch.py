from pydantic import BaseModel, Field


class BranchBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    location: str | None = None


class BranchCreate(BranchBase):
    company_id: int


class BranchResponse(BranchBase):
    id: int
    company_id: int