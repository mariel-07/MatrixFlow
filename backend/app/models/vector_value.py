from sqlalchemy import ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class VectorValue(Base):
    __tablename__ = "vector_values"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    vector_id: Mapped[int] = mapped_column(
        ForeignKey("vectors.id"),
        nullable=False,
    )

    position: Mapped[int] = mapped_column(
        nullable=False,
    )

    value: Mapped[float] = mapped_column(
        Numeric(18, 6),
        nullable=False,
    )