
from app.schemas.vector import VectorCreate, VectorResponse
from app.models.vector import Vector
from app.models.vector_value import VectorValue
from app.core.database import SessionLocal


def create_vector(data: VectorCreate) -> VectorResponse:
    db = SessionLocal()

    try:
        vector = Vector(
            name=data.name,
            description=data.description,
        )

        db.add(vector)
        db.flush()

        for index, value in enumerate(data.values):
            vector_value = VectorValue(
                vector_id=vector.id,
                position=index,
                value=value,
            )

            db.add(vector_value)

        db.commit()
        db.refresh(vector)

        return VectorResponse(
            id=vector.id,
            name=vector.name,
            description=vector.description,
            values=data.values,
        )

    finally:
        db.close()


def get_vectors() -> list[VectorResponse]:
    db = SessionLocal()

    try:
        vectors = db.query(Vector).all()

        result = []

        for vector in vectors:
            values = (
                db.query(VectorValue)
                .filter(VectorValue.vector_id == vector.id)
                .order_by(VectorValue.position)
                .all()
            )

            vector_values = [
                item.value
                for item in values
            ]

            result.append(
                VectorResponse(
                    id=vector.id,
                    name=vector.name,
                    description=vector.description,
                    values=vector_values,
                )
            )

        return result

    finally:
        db.close()


def get_vector_by_id(vector_id: int) -> VectorResponse | None:
    db = SessionLocal()
    try:
        vector = db.query(Vector).filter(Vector.id == vector_id).first()
        if not vector:
            return None
        values = (
            db.query(VectorValue)
            .filter(VectorValue.vector_id == vector.id)
            .order_by(VectorValue.position)
            .all()
        )
        return VectorResponse(
            id=vector.id,
            name=vector.name,
            description=vector.description,
            values=[item.value for item in values],
        )
    finally:
        db.close()


def update_vector(vector_id: int, data: VectorCreate) -> VectorResponse | None:
    db = SessionLocal()
    try:
        vector = db.query(Vector).filter(Vector.id == vector_id).first()
        if not vector:
            return None
        vector.name = data.name
        vector.description = data.description
        db.query(VectorValue).filter(VectorValue.vector_id == vector_id).delete()
        for index, value in enumerate(data.values):
            vector_value = VectorValue(
                vector_id=vector.id,
                position=index,
                value=value,
            )
            db.add(vector_value)
        db.commit()
        db.refresh(vector)
        return VectorResponse(
            id=vector.id,
            name=vector.name,
            description=vector.description,
            values=data.values,
        )
    finally:
        db.close()


def delete_vector(vector_id: int) -> bool:
    db = SessionLocal()
    try:
        vector = db.query(Vector).filter(Vector.id == vector_id).first()
        if not vector:
            return False
        db.query(VectorValue).filter(VectorValue.vector_id == vector_id).delete()
        db.delete(vector)
        db.commit()
        return True
    finally:
        db.close()


