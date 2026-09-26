from typing import Any

from pydantic import BaseModel


class ReportResponse(BaseModel):
    report_type: str
    data: list[dict[str, Any]]