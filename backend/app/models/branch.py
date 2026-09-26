from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Branch(Base):
    __tablename__ = "branches"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    location: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"),
        nullable=False,
    )

    company: Mapped["Company"] = relationship(
        back_populates="branches",
    )

    sales: Mapped[list["Sale"]] = relationship(
        back_populates="branch",
    )