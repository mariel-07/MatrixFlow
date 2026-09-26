from sqlalchemy import ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class OperationInput(Base):
    __tablename__ = "operation_inputs"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    operation_id: Mapped[int] = mapped_column(
        ForeignKey("operations.id"),
        nullable=False,
    )

    input_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    reference_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    value: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    position: Mapped[int] = mapped_column(
        nullable=False,
    )