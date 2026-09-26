"""
Unit tests for app.algorithms.vector

Tests cover all public functions:
  sum_vector, subtract_vector, scalar_multiply, dot_product
"""
import pytest
from app.algorithms.vector import (
    sum_vector,
    subtract_vector,
    scalar_multiply,
    dot_product,
)


class TestSumVector:
    """Tests for sum_vector() — element-wise vector addition."""

    def test_sum_3d_vectors(self):
        result = sum_vector([1.0, 2.0, 3.0], [4.0, 5.0, 6.0])
        assert result == [5.0, 7.0, 9.0]

    def test_sum_with_zeros(self):
        result = sum_vector([0.0, 0.0, 0.0], [1.0, 2.0, 3.0])
        assert result == [1.0, 2.0, 3.0]

    def test_sum_with_negatives(self):
        result = sum_vector([-1.0, -2.0], [1.0, 2.0])
        assert result == [0.0, 0.0]

    def test_sum_mismatched_dims_raises(self):
        with pytest.raises(ValueError):
            sum_vector([1.0, 2.0], [1.0, 2.0, 3.0])

    def test_sum_single_element(self):
        result = sum_vector([5.0], [3.0])
        assert result == [8.0]

    def test_sum_commutative(self):
        a = [1.0, 2.0, 3.0]
        b = [4.0, 5.0, 6.0]
        assert sum_vector(a, b) == sum_vector(b, a)


class TestSubtractVector:
    """Tests for subtract_vector() — element-wise vector subtraction."""

    def test_subtract_3d_vectors(self):
        result = subtract_vector([4.0, 5.0, 6.0], [1.0, 2.0, 3.0])
        assert result == [3.0, 3.0, 3.0]

    def test_subtract_same_vector_gives_zeros(self):
        v = [1.0, 2.0, 3.0]
        result = subtract_vector(v, v)
        assert result == [0.0, 0.0, 0.0]

    def test_subtract_mismatched_dims_raises(self):
        with pytest.raises(ValueError):
            subtract_vector([1.0, 2.0], [1.0])

    def test_subtract_produces_negatives(self):
        result = subtract_vector([1.0, 1.0], [5.0, 5.0])
        assert result == [-4.0, -4.0]

    def test_subtract_with_zeros(self):
        result = subtract_vector([3.0, 6.0, 9.0], [0.0, 0.0, 0.0])
        assert result == [3.0, 6.0, 9.0]

    def test_subtract_single_element(self):
        result = subtract_vector([10.0], [4.0])
        assert result == [6.0]


class TestScalarMultiply:
    """Tests for scalar_multiply() — multiply each element by a scalar."""

    def test_multiply_by_3(self):
        result = scalar_multiply([1.0, 2.0, 3.0], 3)
        assert result == [3.0, 6.0, 9.0]

    def test_multiply_by_zero(self):
        result = scalar_multiply([1.0, 2.0, 3.0], 0)
        assert result == [0.0, 0.0, 0.0]

    def test_multiply_by_negative_one(self):
        result = scalar_multiply([1.0, -2.0, 3.0], -1)
        assert result == [-1.0, 2.0, -3.0]

    def test_multiply_by_float_scalar(self):
        result = scalar_multiply([2.0, 4.0, 6.0], 0.5)
        assert result == [1.0, 2.0, 3.0]

    def test_multiply_by_one_is_identity(self):
        v = [7.0, 8.0, 9.0]
        assert scalar_multiply(v, 1) == v

    def test_multiply_single_element(self):
        result = scalar_multiply([5.0], 4)
        assert result == [20.0]


class TestDotProduct:
    """Tests for dot_product() — scalar dot product of two vectors."""

    def test_orthogonal_unit_vectors(self):
        result = dot_product([1.0, 0.0, 0.0], [0.0, 1.0, 0.0])
        assert result == 0.0

    def test_dot_product_standard(self):
        # 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
        result = dot_product([1.0, 2.0, 3.0], [4.0, 5.0, 6.0])
        assert result == 32.0

    def test_dot_product_mismatched_dims_raises(self):
        with pytest.raises(ValueError):
            dot_product([1.0, 2.0], [1.0, 2.0, 3.0])

    def test_dot_product_with_zeros(self):
        result = dot_product([0.0, 0.0, 0.0], [1.0, 2.0, 3.0])
        assert result == 0.0

    def test_dot_product_parallel_unit_vectors(self):
        result = dot_product([1.0, 0.0, 0.0], [1.0, 0.0, 0.0])
        assert result == 1.0

    def test_dot_product_commutative(self):
        a = [1.0, 2.0, 3.0]
        b = [4.0, 5.0, 6.0]
        assert dot_product(a, b) == dot_product(b, a)

    def test_dot_product_single_element(self):
        result = dot_product([3.0], [4.0])
        assert result == 12.0

    def test_dot_product_with_negatives(self):
        # (-1)*1 + 2*(-2) = -1 - 4 = -5
        result = dot_product([-1.0, 2.0], [1.0, -2.0])
        assert result == -5.0
