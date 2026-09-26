from pydantic import BaseModel, Field


class VectorCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: str | None = None
    values: list[float] = Field(..., min_length=1)


class VectorResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    values: list[float]