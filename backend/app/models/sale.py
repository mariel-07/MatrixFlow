from sqlalchemy import ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Sale(Base):
    __tablename__ = "sales"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    branch_id: Mapped[int] = mapped_column(
        ForeignKey("branches.id"),
        nullable=False,
    )

    total: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    branch: Mapped["Branch"] = relationship(
        back_populates="sales",
    )

    details: Mapped[list["SaleDetail"]] = relationship(
        back_populates="sale",
        cascade="all, delete-orphan",
    )