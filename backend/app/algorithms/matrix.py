import numpy as np


def add_matrix(
    a: list[list[float]],
    b: list[list[float]],
) -> list[list[float]]:
    validate_matrix_dimensions(a, b)

    result = np.array(a) + np.array(b)

    return result.tolist()


def subtract_matrix(
    a: list[list[float]],
    b: list[list[float]],
) -> list[list[float]]:
    validate_matrix_dimensions(a, b)

    result = np.array(a) - np.array(b)

    return result.tolist()


def multiply_matrix(
    a: list[list[float]],
    b: list[list[float]],
) -> list[list[float]]:
    matrix_a = np.array(a)
    matrix_b = np.array(b)

    if matrix_a.shape[1] != matrix_b.shape[0]:
        raise ValueError(
            "Las dimensiones no permiten multiplicar las matrices"
        )

    result = np.matmul(matrix_a, matrix_b)

    return result.tolist()


def transpose_matrix(
    matrix: list[list[float]],
) -> list[list[float]]:
    result = np.transpose(np.array(matrix))

    return result.tolist()


def scalar_multiply_matrix(
    matrix: list[list[float]],
    scalar: float,
) -> list[list[float]]:
    result = np.array(matrix) * scalar

    return result.tolist()


def validate_matrix_dimensions(
    a: list[list[float]],
    b: list[list[float]],
) -> None:
    matrix_a = np.array(a)
    matrix_b = np.array(b)

    if matrix_a.shape != matrix_b.shape:
        raise ValueError(
            "Las matrices deben tener las mismas dimensiones"
        )