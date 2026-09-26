from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Target(Base):
    __tablename__ = "targets"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    branch_id: Mapped[int] = mapped_column(
        ForeignKey("branches.id"),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    target_value: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    branch: Mapped["Branch"] = relationship()