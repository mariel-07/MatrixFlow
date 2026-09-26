
from app.schemas.product import ProductCreate, ProductResponse
from app.models.product import Product
from app.core.database import SessionLocal


def create_product(data: ProductCreate) -> ProductResponse:
    db = SessionLocal()

    try:
        product = Product(
            name=data.name,
            description=data.description,
            price=data.price,
            category_id=data.category_id,
        )

        db.add(product)
        db.commit()
        db.refresh(product)

        return ProductResponse(
            id=product.id,
            name=product.name,
            description=product.description,
            price=product.price,
            category_id=product.category_id,
        )

    finally:
        db.close()


def get_products() -> list[ProductResponse]:
    db = SessionLocal()

    try:
        products = db.query(Product).all()

        return [
            ProductResponse(
                id=product.id,
                name=product.name,
                description=product.description,
                price=product.price,
                category_id=product.category_id,
            )
            for product in products
        ]

    finally:
        db.close()


def get_product_by_id(product_id: int) -> ProductResponse | None:
    db = SessionLocal()
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return None
        return ProductResponse(
            id=product.id,
            name=product.name,
            description=product.description,
            price=product.price,
            category_id=product.category_id,
        )
    finally:
        db.close()


def update_product(product_id: int, data: ProductCreate) -> ProductResponse | None:
    db = SessionLocal()
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return None
        product.name = data.name
        product.description = data.description
        product.price = data.price
        product.category_id = data.category_id
        db.commit()
        db.refresh(product)
        return ProductResponse(
            id=product.id,
            name=product.name,
            description=product.description,
            price=product.price,
            category_id=product.category_id,
        )
    finally:
        db.close()


def delete_product(product_id: int) -> bool:
    db = SessionLocal()
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return False
        db.delete(product)
        db.commit()
        return True
    finally:
        db.close()


