from app.schemas.matrix import MatrixCreate, MatrixResponse
from app.models.matrix import Matrix
from app.models.matrix_value import MatrixValue
from app.core.database import SessionLocal


def create_matrix(data: MatrixCreate) -> MatrixResponse:
    db = SessionLocal()

    try:
        rows = len(data.values)
        columns = len(data.values[0]) if rows > 0 else 0

        matrix = Matrix(
            name=data.name,
            description=data.description,
            rows=rows,
            columns=columns,
        )

        db.add(matrix)
        db.commit()
        db.refresh(matrix)

        for row_index, row_values in enumerate(data.values):
            for column_index, value in enumerate(row_values):
                matrix_value = MatrixValue(
                    matrix_id=matrix.id,
                    row=row_index,
                    column=column_index,
                    value=value,
                )

                db.add(matrix_value)

        db.commit()

        return MatrixResponse(
            id=matrix.id,
            name=matrix.name,
            description=matrix.description,
            values=data.values,
        )

    finally:
        db.close()


def get_matrices() -> list[MatrixResponse]:
    db = SessionLocal()

    try:
        matrices = db.query(Matrix).all()
        result = []

        for matrix in matrices:
            matrix_values = (
                db.query(MatrixValue)
                .filter(MatrixValue.matrix_id == matrix.id)
                .order_by(MatrixValue.row, MatrixValue.column)
                .all()
            )

            values = []

            for row_index in range(matrix.rows):
                row_values = []

                for column_index in range(matrix.columns):
                    found_value = None

                    for item in matrix_values:
                        if (
                            item.row == row_index
                            and item.column == column_index
                        ):
                            found_value = item.value
                            break

                    row_values.append(
                        float(found_value)
                        if found_value is not None
                        else 0
                    )

                values.append(row_values)

            result.append(
                MatrixResponse(
                    id=matrix.id,
                    name=matrix.name,
                    description=matrix.description,
                    values=values,
                )
            )

        return result

    finally:
        db.close()


def get_matrix_by_id(matrix_id: int) -> MatrixResponse | None:
    db = SessionLocal()
    try:
        matrix = db.query(Matrix).filter(Matrix.id == matrix_id).first()
        if not matrix:
            return None
        matrix_values = (
            db.query(MatrixValue)
            .filter(MatrixValue.matrix_id == matrix.id)
            .order_by(MatrixValue.row, MatrixValue.column)
            .all()
        )
        values = []
        for row_index in range(matrix.rows):
            row_values = []
            for column_index in range(matrix.columns):
                found_value = None
                for item in matrix_values:
                    if item.row == row_index and item.column == column_index:
                        found_value = item.value
                        break
                row_values.append(float(found_value) if found_value is not None else 0.0)
            values.append(row_values)
        return MatrixResponse(
            id=matrix.id,
            name=matrix.name,
            description=matrix.description,
            values=values,
        )
    finally:
        db.close()


def update_matrix(matrix_id: int, data: MatrixCreate) -> MatrixResponse | None:
    db = SessionLocal()
    try:
        matrix = db.query(Matrix).filter(Matrix.id == matrix_id).first()
        if not matrix:
            return None
        rows = len(data.values)
        columns = len(data.values[0]) if rows > 0 else 0
        matrix.name = data.name
        matrix.description = data.description
        matrix.rows = rows
        matrix.columns = columns
        db.query(MatrixValue).filter(MatrixValue.matrix_id == matrix.id).delete()
        for row_index, row_values in enumerate(data.values):
            for column_index, value in enumerate(row_values):
                matrix_value = MatrixValue(
                    matrix_id=matrix.id,
                    row=row_index,
                    column=column_index,
                    value=value,
                )
                db.add(matrix_value)
        db.commit()
        db.refresh(matrix)
        return MatrixResponse(
            id=matrix.id,
            name=matrix.name,
            description=matrix.description,
            values=data.values,
        )
    finally:
        db.close()


def delete_matrix(matrix_id: int) -> bool:
    db = SessionLocal()
    try:
        matrix = db.query(Matrix).filter(Matrix.id == matrix_id).first()
        if not matrix:
            return False
        db.query(MatrixValue).filter(MatrixValue.matrix_id == matrix_id).delete()
        db.delete(matrix)
        db.commit()
        return True
    finally:
        db.close()
