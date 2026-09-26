from app.schemas.inventory import InventoryCreate, InventoryResponse
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.branch import Branch
from app.core.database import SessionLocal


def create_inventory(data: InventoryCreate) -> InventoryResponse:
    db = SessionLocal()

    try:
        # Check if inventory record for this product and branch already exists
        existing = (
            db.query(Inventory)
            .filter(
                Inventory.product_id == data.product_id,
                Inventory.branch_id == data.branch_id,
            )
            .first()
        )

        if existing:
            existing.quantity = data.quantity
            inventory = existing
        else:
            inventory = Inventory(
                product_id=data.product_id,
                branch_id=data.branch_id,
                quantity=data.quantity,
            )
            db.add(inventory)

        db.commit()
        db.refresh(inventory)

        product = db.query(Product).filter(Product.id == inventory.product_id).first()
        branch = db.query(Branch).filter(Branch.id == inventory.branch_id).first()

        return InventoryResponse(
            id=inventory.id,
            product_id=inventory.product_id,
            branch_id=inventory.branch_id,
            quantity=float(inventory.quantity),
            product_name=product.name if product else f"Producto #{inventory.product_id}",
            branch_name=branch.name if branch else f"Sucursal #{inventory.branch_id}",
        )

    finally:
        db.close()


def get_inventory() -> list[InventoryResponse]:
    db = SessionLocal()

    try:
        inventory_items = db.query(Inventory).all()

        result = []
        for item in inventory_items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            branch = db.query(Branch).filter(Branch.id == item.branch_id).first()

            result.append(
                InventoryResponse(
                    id=item.id,
                    product_id=item.product_id,
                    branch_id=item.branch_id,
                    quantity=float(item.quantity),
                    product_name=product.name if product else f"Producto #{item.product_id}",
                    branch_name=branch.name if branch else f"Sucursal #{item.branch_id}",
                )
            )

        return result

    finally:
        db.close()


def delete_inventory(inventory_id: int) -> bool:
    db = SessionLocal()
    try:
        item = db.query(Inventory).filter(Inventory.id == inventory_id).first()
        if not item:
            return False
        db.delete(item)
        db.commit()
        return True
    finally:
        db.close()
