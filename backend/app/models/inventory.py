from sqlalchemy import ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Inventory(Base):
    __tablename__ = "inventory"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        nullable=False,
    )

    branch_id: Mapped[int] = mapped_column(
        ForeignKey("branches.id"),
        nullable=False,
    )

    quantity: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    product: Mapped["Product"] = relationship()

    branch: Mapped["Branch"] = relationship()