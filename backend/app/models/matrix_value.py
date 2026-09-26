from sqlalchemy import ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class MatrixValue(Base):
    __tablename__ = "matrix_values"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    matrix_id: Mapped[int] = mapped_column(
        ForeignKey("matrices.id"),
        nullable=False,
    )

    row: Mapped[int] = mapped_column(
        nullable=False,
    )

    column: Mapped[int] = mapped_column(
        nullable=False,
    )

    value: Mapped[float] = mapped_column(
        Numeric(18, 6),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "matrix_id",
            "row",
            "column",
            name="uq_matrix_value_position",
        ),
    )