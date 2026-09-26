
from app.schemas.sale import SaleCreate, SaleResponse, SaleDetailResponse
from app.models.sale import Sale
from app.models.sale_detail import SaleDetail
from app.models.branch import Branch
from app.models.product import Product
from app.core.database import SessionLocal


def create_sale(data: SaleCreate) -> SaleResponse:
    db = SessionLocal()

    try:
        total = sum(
            detail.quantity * detail.unit_price
            for detail in data.details
        )

        sale = Sale(
            branch_id=data.branch_id,
            total=total,
        )

        db.add(sale)
        db.flush()

        detail_responses = []
        for detail in data.details:
            sale_detail = SaleDetail(
                sale_id=sale.id,
                product_id=detail.product_id,
                quantity=detail.quantity,
                unit_price=detail.unit_price,
            )

            db.add(sale_detail)
            product = db.query(Product).filter(Product.id == detail.product_id).first()
            detail_responses.append(
                SaleDetailResponse(
                    product_id=detail.product_id,
                    product_name=product.name if product else f"Producto #{detail.product_id}",
                    quantity=detail.quantity,
                    unit_price=detail.unit_price,
                )
            )

        db.commit()
        db.refresh(sale)

        branch = db.query(Branch).filter(Branch.id == sale.branch_id).first()

        return SaleResponse(
            id=sale.id,
            branch_id=sale.branch_id,
            branch_name=branch.name if branch else f"Sucursal #{sale.branch_id}",
            total=sale.total,
            details=detail_responses,
        )

    finally:
        db.close()


def get_sales() -> list[SaleResponse]:
    db = SessionLocal()

    try:
        sales = db.query(Sale).all()
        result = []

        for sale in sales:
            branch = db.query(Branch).filter(Branch.id == sale.branch_id).first()
            details = (
                db.query(SaleDetail)
                .filter(SaleDetail.sale_id == sale.id)
                .all()
            )

            detail_responses = []
            for d in details:
                p = db.query(Product).filter(Product.id == d.product_id).first()
                detail_responses.append(
                    SaleDetailResponse(
                        id=d.id,
                        product_id=d.product_id,
                        product_name=p.name if p else f"Producto #{d.product_id}",
                        quantity=float(d.quantity),
                        unit_price=float(d.unit_price),
                    )
                )

            result.append(
                SaleResponse(
                    id=sale.id,
                    branch_id=sale.branch_id,
                    branch_name=branch.name if branch else f"Sucursal #{sale.branch_id}",
                    total=float(sale.total),
                    details=detail_responses,
                )
            )

        return result

    finally:
        db.close()


def delete_sale(sale_id: int) -> bool:
    db = SessionLocal()
    try:
        sale = db.query(Sale).filter(Sale.id == sale_id).first()
        if not sale:
            return False
        db.query(SaleDetail).filter(SaleDetail.sale_id == sale_id).delete()
        db.delete(sale)
        db.commit()
        return True
    finally:
        db.close()


