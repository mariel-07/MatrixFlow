"""
Unit tests for app.algorithms.matrix

Tests cover all public functions:
  add_matrix, subtract_matrix, multiply_matrix,
  transpose_matrix, scalar_multiply_matrix, validate_matrix_dimensions
"""
import pytest
from app.algorithms.matrix import (
    add_matrix,
    subtract_matrix,
    multiply_matrix,
    transpose_matrix,
    scalar_multiply_matrix,
    validate_matrix_dimensions,
)


class TestAddMatrix:
    """Tests for add_matrix() — element-wise matrix addition."""

    def test_add_2x2_matrices(self):
        a = [[1, 2], [3, 4]]
        b = [[5, 6], [7, 8]]
        result = add_matrix(a, b)
        assert result == [[6, 8], [10, 12]]

    def test_add_with_zeros(self):
        a = [[0, 0], [0, 0]]
        b = [[1, 2], [3, 4]]
        result = add_matrix(a, b)
        assert result == [[1, 2], [3, 4]]

    def test_add_dimension_mismatch_raises(self):
        with pytest.raises(ValueError):
            add_matrix([[1, 2]], [[1, 2, 3]])

    def test_add_negative_values(self):
        result = add_matrix([[-1, -2]], [[1, 2]])
        assert result == [[0, 0]]

    def test_add_floats(self):
        result = add_matrix([[1.5, 2.5]], [[0.5, 0.5]])
        assert result == [[2.0, 3.0]]

    def test_add_3x3_matrices(self):
        a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
        b = [[9, 8, 7], [6, 5, 4], [3, 2, 1]]
        result = add_matrix(a, b)
        assert result == [[10, 10, 10], [10, 10, 10], [10, 10, 10]]

    def test_add_row_count_mismatch_raises(self):
        with pytest.raises(ValueError):
            add_matrix([[1, 2], [3, 4]], [[1, 2]])


class TestSubtractMatrix:
    """Tests for subtract_matrix() — element-wise matrix subtraction."""

    def test_subtract_2x2(self):
        result = subtract_matrix([[5, 6], [7, 8]], [[1, 2], [3, 4]])
        assert result == [[4, 4], [4, 4]]

    def test_subtract_same_matrix_gives_zeros(self):
        a = [[1, 2], [3, 4]]
        result = subtract_matrix(a, a)
        assert result == [[0, 0], [0, 0]]

    def test_subtract_dimension_mismatch_raises(self):
        with pytest.raises(ValueError):
            subtract_matrix([[1, 2]], [[1]])

    def test_subtract_produces_negatives(self):
        result = subtract_matrix([[1, 1]], [[5, 5]])
        assert result == [[-4, -4]]

    def test_subtract_3x3(self):
        a = [[10, 20, 30], [40, 50, 60], [70, 80, 90]]
        b = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
        result = subtract_matrix(a, b)
        assert result == [[9, 18, 27], [36, 45, 54], [63, 72, 81]]

    def test_subtract_row_count_mismatch_raises(self):
        with pytest.raises(ValueError):
            subtract_matrix([[1, 2], [3, 4]], [[1, 2]])


class TestMultiplyMatrix:
    """Tests for multiply_matrix() — standard matrix multiplication (matmul)."""

    def test_multiply_2x2(self):
        a = [[1, 2], [3, 4]]
        b = [[5, 6], [7, 8]]
        result = multiply_matrix(a, b)
        assert result == [[19, 22], [43, 50]]

    def test_multiply_identity(self):
        a = [[1, 2], [3, 4]]
        identity = [[1, 0], [0, 1]]
        result = multiply_matrix(a, identity)
        assert result == [[1, 2], [3, 4]]

    def test_multiply_incompatible_raises(self):
        """Columns of A must equal rows of B."""
        with pytest.raises(ValueError):
            multiply_matrix([[1, 2, 3]], [[1, 2], [3, 4]])

    def test_multiply_1x2_by_2x1(self):
        result = multiply_matrix([[1, 2]], [[3], [4]])
        assert result == [[11]]

    def test_multiply_by_zero_matrix(self):
        a = [[1, 2], [3, 4]]
        zero = [[0, 0], [0, 0]]
        result = multiply_matrix(a, zero)
        assert result == [[0, 0], [0, 0]]

    def test_multiply_2x3_by_3x2(self):
        a = [[1, 2, 3], [4, 5, 6]]
        b = [[7, 8], [9, 10], [11, 12]]
        result = multiply_matrix(a, b)
        assert result == [[58, 64], [139, 154]]


class TestTransposeMatrix:
    """Tests for transpose_matrix() — rows become columns."""

    def test_transpose_2x2(self):
        result = transpose_matrix([[1, 2], [3, 4]])
        assert result == [[1, 3], [2, 4]]

    def test_transpose_rectangular(self):
        result = transpose_matrix([[1, 2, 3]])
        assert result == [[1], [2], [3]]

    def test_transpose_column_vector(self):
        result = transpose_matrix([[1], [2], [3]])
        assert result == [[1, 2, 3]]

    def test_transpose_3x3(self):
        a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
        result = transpose_matrix(a)
        assert result == [[1, 4, 7], [2, 5, 8], [3, 6, 9]]

    def test_double_transpose_is_identity(self):
        a = [[1, 2, 3], [4, 5, 6]]
        assert transpose_matrix(transpose_matrix(a)) == a


class TestScalarMultiplyMatrix:
    """Tests for scalar_multiply_matrix() — multiply every element by a scalar."""

    def test_multiply_by_2(self):
        result = scalar_multiply_matrix([[1, 2], [3, 4]], 2)
        assert result == [[2, 4], [6, 8]]

    def test_multiply_by_zero(self):
        result = scalar_multiply_matrix([[1, 2], [3, 4]], 0)
        assert result == [[0, 0], [0, 0]]

    def test_multiply_by_negative(self):
        result = scalar_multiply_matrix([[1, 2]], -1)
        assert result == [[-1, -2]]

    def test_multiply_by_one_is_identity(self):
        a = [[5, 6], [7, 8]]
        result = scalar_multiply_matrix(a, 1)
        assert result == a

    def test_multiply_by_float_scalar(self):
        result = scalar_multiply_matrix([[2, 4]], 0.5)
        assert result == [[1.0, 2.0]]

    def test_multiply_3x3(self):
        a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
        result = scalar_multiply_matrix(a, 3)
        assert result == [[3, 6, 9], [12, 15, 18], [21, 24, 27]]


class TestValidateMatrixDimensions:
    """Tests for validate_matrix_dimensions() — shape equality check."""

    def test_same_dimensions_passes(self):
        # Should not raise
        validate_matrix_dimensions([[1, 2], [3, 4]], [[5, 6], [7, 8]])

    def test_different_col_count_raises(self):
        with pytest.raises(ValueError):
            validate_matrix_dimensions([[1, 2]], [[1, 2, 3]])

    def test_different_row_count_raises(self):
        with pytest.raises(ValueError):
            validate_matrix_dimensions([[1, 2], [3, 4]], [[1, 2]])

    def test_1x1_same_dimensions_passes(self):
        validate_matrix_dimensions([[5]], [[9]])

    def test_3x3_same_dimensions_passes(self):
        a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
        b = [[9, 8, 7], [6, 5, 4], [3, 2, 1]]
        validate_matrix_dimensions(a, b)
