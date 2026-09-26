import numpy as np


def validate_dimensions(
    vectors: list[list[float]],
) -> None:
    if not vectors:
        raise ValueError("Debe existir al menos un vector")

    dimension = len(vectors[0])

    if dimension == 0:
        raise ValueError("Los vectores no pueden estar vacíos")

    for vector in vectors:
        if len(vector) != dimension:
            raise ValueError(
                "Todos los vectores deben tener la misma dimensión"
            )


def validate_vector(
    vector: list[float],
) -> None:
    if not vector:
        raise ValueError("El vector no puede estar vacío")


def validate_matrix(
    matrix: list[list[float]],
) -> None:
    if not matrix:
        raise ValueError("La matriz no puede estar vacía")

    columns = len(matrix[0])

    if columns == 0:
        raise ValueError(
            "La matriz debe tener al menos una columna"
        )

    for row in matrix:
        if len(row) != columns:
            raise ValueError(
                "Todas las filas deben tener la misma cantidad de columnas"
            )


def linear_combination(
    vectors: list[list[float]],
    coefficients: list[float],
) -> list[float]:
    validate_dimensions(vectors)

    if len(vectors) != len(coefficients):
        raise ValueError(
            "La cantidad de coeficientes debe coincidir "
            "con la cantidad de vectores"
        )

    matrix = np.array(vectors, dtype=float)
    coefficients_array = np.array(coefficients, dtype=float)

    result = coefficients_array @ matrix

    return result.tolist()