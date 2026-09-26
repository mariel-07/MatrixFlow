from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class OperationCreate(BaseModel):
    operation_type: str = Field(..., min_length=2)
    inputs: list[Any] = Field(..., min_length=1)


class OperationResponse(BaseModel):
    id: int
    operation_type: str
    inputs: list[Any]
    result: Any
    status: str
    created_at: datetime | None = None