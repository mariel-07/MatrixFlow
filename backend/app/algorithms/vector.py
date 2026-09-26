import numpy as np


def sum_vector(a: list[float], b: list[float]) -> list[float]:
    if len(a) != len(b):
        raise ValueError("Los vectores deben tener la misma dimensión")

    result = np.array(a) + np.array(b)

    return result.tolist()


def subtract_vector(a: list[float], b: list[float]) -> list[float]:
    if len(a) != len(b):
        raise ValueError("Los vectores deben tener la misma dimensión")

    result = np.array(a) - np.array(b)

    return result.tolist()


def scalar_multiply(
    vector: list[float],
    scalar: float,
) -> list[float]:
    result = np.array(vector) * scalar

    return result.tolist()


def dot_product(
    a: list[float],
    b: list[float],
) -> float:
    if len(a) != len(b):
        raise ValueError("Los vectores deben tener la misma dimensión")

    result = np.dot(np.array(a), np.array(b))

    return float(result)