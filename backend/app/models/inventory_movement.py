from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    inventory_id: Mapped[int] = mapped_column(
        ForeignKey("inventory.id"),
        nullable=False,
    )

    movement_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    quantity: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    inventory: Mapped["Inventory"] = relationship()