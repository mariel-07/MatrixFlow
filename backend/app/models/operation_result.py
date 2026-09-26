from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class OperationResult(Base):
    __tablename__ = "operation_results"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    operation_id: Mapped[int] = mapped_column(
        ForeignKey("operations.id"),
        nullable=False,
    )

    result_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    value: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )