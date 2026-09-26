from sqlalchemy import ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SaleDetail(Base):
    __tablename__ = "sale_details"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    sale_id: Mapped[int] = mapped_column(
        ForeignKey("sales.id"),
        nullable=False,
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        nullable=False,
    )

    quantity: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    unit_price: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    sale: Mapped["Sale"] = relationship(
        back_populates="details",
    )

    product: Mapped["Product"] = relationship()