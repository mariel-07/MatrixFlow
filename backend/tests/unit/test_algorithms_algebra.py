"""
Unit tests for app.algorithms.algebra

Tests cover all public functions:
  linear_combination, validate_dimensions, validate_vector, validate_matrix
"""
import pytest
from app.algorithms.algebra import (
    linear_combination,
    validate_dimensions,
    validate_vector,
    validate_matrix,
)


class TestLinearCombination:
    """Tests for linear_combination(vectors, coefficients).

    Computes: coefficients[0]*vectors[0] + ... + coefficients[n]*vectors[n]
    """

    def test_two_basis_vectors(self):
        # 2*[1,0] + 3*[0,1] = [2, 3]
        result = linear_combination([[1, 0], [0, 1]], [2, 3])
        assert result == [2.0, 3.0]

    def test_3d_vectors(self):
        # 1*[1,2,3] + 2*[4,5,6] = [1+8, 2+10, 3+12] = [9, 12, 15]
        result = linear_combination([[1, 2, 3], [4, 5, 6]], [1, 2])
        assert result == [9.0, 12.0, 15.0]

    def test_coefficient_vector_count_mismatch_raises(self):
        with pytest.raises(ValueError):
            linear_combination([[1, 0], [0, 1]], [2])  # 2 vectors, 1 coefficient

    def test_empty_vectors_raises(self):
        with pytest.raises(ValueError):
            linear_combination([], [])

    def test_different_dimensions_raises(self):
        with pytest.raises(ValueError):
            linear_combination([[1, 2], [1, 2, 3]], [1, 1])

    def test_zero_coefficients(self):
        result = linear_combination([[1, 2, 3], [4, 5, 6]], [0, 0])
        assert result == [0.0, 0.0, 0.0]

    def test_single_vector(self):
        # 3 * [2, 4, 6] = [6, 12, 18]
        result = linear_combination([[2, 4, 6]], [3])
        assert result == [6.0, 12.0, 18.0]

    def test_three_vectors(self):
        # 1*[1,0,0] + 2*[0,1,0] + 3*[0,0,1] = [1, 2, 3]
        result = linear_combination([[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1, 2, 3])
        assert result == [1.0, 2.0, 3.0]

    def test_negative_coefficients(self):
        # -1*[1,2] + 1*[3,4] = [2, 2]
        result = linear_combination([[1, 2], [3, 4]], [-1, 1])
        assert result == [2.0, 2.0]

    def test_float_coefficients(self):
        result = linear_combination([[2, 4]], [0.5])
        assert result == [1.0, 2.0]


class TestValidateDimensions:
    """Tests for validate_dimensions(vectors) — checks uniform vector lengths."""

    def test_empty_list_raises(self):
        with pytest.raises(ValueError):
            validate_dimensions([])

    def test_different_length_vectors_raises(self):
        with pytest.raises(ValueError):
            validate_dimensions([[1, 2], [1, 2, 3]])

    def test_valid_vectors_passes(self):
        # Should not raise
        validate_dimensions([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

    def test_single_vector_passes(self):
        validate_dimensions([[1, 2, 3]])

    def test_2d_vectors_uniform_passes(self):
        validate_dimensions([[1, 0], [0, 1]])

    def test_zero_length_vector_raises(self):
        """A vector with zero elements is invalid."""
        with pytest.raises(ValueError):
            validate_dimensions([[]])


class TestValidateVector:
    """Tests for validate_vector(vector) — checks vector is non-empty."""

    def test_empty_list_raises(self):
        with pytest.raises(ValueError):
            validate_vector([])

    def test_non_empty_passes(self):
        # Should not raise
        validate_vector([1.0, 2.0, 3.0])

    def test_single_element_passes(self):
        validate_vector([42.0])

    def test_vector_with_zeros_passes(self):
        validate_vector([0.0, 0.0, 0.0])

    def test_vector_with_negatives_passes(self):
        validate_vector([-1.0, -2.0, -3.0])


class TestValidateMatrix:
    """Tests for validate_matrix(matrix) — checks matrix is non-empty with consistent row lengths."""

    def test_empty_list_raises(self):
        with pytest.raises(ValueError):
            validate_matrix([])

    def test_inconsistent_row_lengths_raises(self):
        with pytest.raises(ValueError):
            validate_matrix([[1, 2, 3], [4, 5]])

    def test_valid_matrix_passes(self):
        # Should not raise
        validate_matrix([[1, 2, 3], [4, 5, 6]])

    def test_single_row_passes(self):
        validate_matrix([[1, 2, 3]])

    def test_single_element_passes(self):
        validate_matrix([[42]])

    def test_3x3_passes(self):
        validate_matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

    def test_row_with_zero_columns_raises(self):
        """A matrix row that is empty is not valid."""
        with pytest.raises(ValueError):
            validate_matrix([[]])
