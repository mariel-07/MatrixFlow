import json

from app.schemas.operation import OperationCreate, OperationResponse

from app.algorithms.vector import (
    sum_vector,
    subtract_vector,
    scalar_multiply,
    dot_product,
)

from app.algorithms.matrix import (
    add_matrix,
    subtract_matrix,
    multiply_matrix,
    transpose_matrix,
    scalar_multiply_matrix,
)

from app.algorithms.algebra import linear_combination

from app.models.operation import Operation
from app.models.operation_input import OperationInput
from app.models.operation_result import OperationResult
from app.core.database import SessionLocal


def create_operation(data: OperationCreate) -> OperationResponse:
    type_map = {
        "vector_sum": "sum_vector",
        "vector_subtract": "subtract_vector",
        "vector_scalar": "scalar_multiply",
        "vector_dot": "dot_product",
        "matrix_sum": "add_matrix",
        "matrix_subtract": "subtract_matrix",
        "matrix_multiply": "multiply_matrix",
        "matrix_transpose": "transpose_matrix",
        "matrix_scalar": "scalar_multiply_matrix",
    }
    operation_type = type_map.get(data.operation_type.lower(), data.operation_type.lower())

    result = None

    if operation_type == "sum_vector":
        result = sum_vector(
            data.inputs[0],
            data.inputs[1],
        )

    elif operation_type == "subtract_vector":
        result = subtract_vector(
            data.inputs[0],
            data.inputs[1],
        )

    elif operation_type == "scalar_multiply":
        result = scalar_multiply(
            data.inputs[0],
            data.inputs[1],
        )

    elif operation_type == "dot_product":
        result = dot_product(
            data.inputs[0],
            data.inputs[1],
        )

    elif operation_type == "add_matrix":
        result = add_matrix(
            data.inputs[0],
            data.inputs[1],
        )

    elif operation_type == "subtract_matrix":
        result = subtract_matrix(
            data.inputs[0],
            data.inputs[1],
        )

    elif operation_type == "multiply_matrix":
        result = multiply_matrix(
            data.inputs[0],
            data.inputs[1],
        )

    elif operation_type == "transpose_matrix":
        result = transpose_matrix(
            data.inputs[0],
        )

    elif operation_type == "scalar_multiply_matrix":
        result = scalar_multiply_matrix(
            data.inputs[0],
            data.inputs[1],
        )

    elif operation_type == "linear_combination":
        result = linear_combination(
            data.inputs[0],
            data.inputs[1],
        )

    else:
        raise ValueError(
            f"Operación no soportada: {data.operation_type}"
        )

    db = SessionLocal()

    try:
        operation = Operation(
            operation_type=operation_type,
            status="completed",
        )

        db.add(operation)
        db.flush()

        # Guardar los inputs de la operación
        for position, value in enumerate(data.inputs):
            operation_input = OperationInput(
                operation_id=operation.id,
                input_type="value",
                value=json.dumps(value),
                position=position,
            )

            db.add(operation_input)

        # Guardar el resultado de la operación
        operation_result = OperationResult(
            operation_id=operation.id,
            result_type=type(result).__name__,
            value=json.dumps(result),
        )

        db.add(operation_result)

        db.commit()
        db.refresh(operation)

        return OperationResponse(
            id=operation.id,
            operation_type=operation.operation_type,
            inputs=data.inputs,
            result=result,
            status=operation.status,
            created_at=operation.created_at,
        )

    finally:
        db.close()


def get_operations() -> list[OperationResponse]:
    db = SessionLocal()

    try:
        operations = db.query(Operation).order_by(Operation.id.desc()).all()

        result = []

        for operation in operations:
            inputs = (
                db.query(OperationInput)
                .filter(
                    OperationInput.operation_id == operation.id
                )
                .order_by(OperationInput.position)
                .all()
            )

            operation_result = (
                db.query(OperationResult)
                .filter(
                    OperationResult.operation_id == operation.id
                )
                .first()
            )

            input_values = [
                json.loads(item.value)
                if item.value
                else None
                for item in inputs
            ]

            operation_value = (
                json.loads(operation_result.value)
                if operation_result and operation_result.value
                else None
            )

            result.append(
                OperationResponse(
                    id=operation.id,
                    operation_type=operation.operation_type,
                    inputs=input_values,
                    result=operation_value,
                    status=operation.status,
                    created_at=operation.created_at,
                )
            )

        return result

    finally:
        db.close()