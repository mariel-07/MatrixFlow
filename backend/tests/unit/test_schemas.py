"""
Unit tests for Pydantic schemas.

Tests validate schema constraints without touching the database or HTTP layer.
Schemas tested: MatrixCreate, MatrixResponse, OperationCreate, OperationResponse
"""
import pytest
from datetime import datetime, timezone
from pydantic import ValidationError

from app.schemas.matrix import MatrixCreate, MatrixResponse
from app.schemas.operation import OperationCreate, OperationResponse


class TestMatrixCreate:
    """Tests for MatrixCreate — validates name length, non-empty values, and row consistency."""

    def test_valid_matrix(self):
        m = MatrixCreate(name="Test Matrix", values=[[1, 2], [3, 4]])
        assert m.name == "Test Matrix"
        assert len(m.values) == 2

    def test_name_too_short_raises(self):
        with pytest.raises(ValidationError) as exc_info:
            MatrixCreate(name="A", values=[[1]])
        assert "name" in str(exc_info.value).lower() or "min_length" in str(exc_info.value).lower()

    def test_empty_values_raises(self):
        with pytest.raises(ValidationError):
            MatrixCreate(name="Matrix", values=[])

    def test_inconsistent_row_lengths_raises(self):
        with pytest.raises(ValidationError):
            MatrixCreate(name="Matrix", values=[[1, 2], [3]])

    def test_name_max_length(self):
        long_name = "A" * 150
        m = MatrixCreate(name=long_name, values=[[1]])
        assert len(m.name) == 150

    def test_name_too_long_raises(self):
        with pytest.raises(ValidationError):
            MatrixCreate(name="A" * 151, values=[[1]])

    def test_description_is_optional(self):
        m = MatrixCreate(name="My Matrix", values=[[1, 2]])
        assert m.description is None

    def test_description_can_be_set(self):
        m = MatrixCreate(name="My Matrix", description="A test matrix", values=[[1, 2]])
        assert m.description == "A test matrix"

    def test_float_values_accepted(self):
        m = MatrixCreate(name="Float Matrix", values=[[1.5, 2.5], [3.5, 4.5]])
        assert m.values[0][0] == 1.5

    def test_single_row_matrix_valid(self):
        m = MatrixCreate(name="Row Matrix", values=[[1, 2, 3]])
        assert len(m.values) == 1
        assert len(m.values[0]) == 3

    def test_single_element_matrix_valid(self):
        m = MatrixCreate(name="Scalar Matrix", values=[[42]])
        assert m.values[0][0] == 42.0

    def test_name_exactly_two_chars_passes(self):
        m = MatrixCreate(name="AB", values=[[1]])
        assert m.name == "AB"

    def test_empty_row_in_values_raises(self):
        with pytest.raises(ValidationError):
            MatrixCreate(name="Bad Matrix", values=[[]])

    def test_3x3_matrix_valid(self):
        m = MatrixCreate(
            name="3x3 Matrix",
            values=[[1, 2, 3], [4, 5, 6], [7, 8, 9]],
        )
        assert len(m.values) == 3
        assert len(m.values[0]) == 3


class TestMatrixResponse:
    """Tests for MatrixResponse schema deserialization."""

    def test_valid_response(self):
        r = MatrixResponse(id=1, name="Test", values=[[1.0, 2.0]])
        assert r.id == 1
        assert r.name == "Test"

    def test_description_optional(self):
        r = MatrixResponse(id=1, name="Test", values=[[1.0]])
        assert r.description is None

    def test_rows_property(self):
        r = MatrixResponse(id=1, name="Test", values=[[1.0, 2.0], [3.0, 4.0]])
        assert r.rows == 2

    def test_columns_property(self):
        r = MatrixResponse(id=1, name="Test", values=[[1.0, 2.0, 3.0]])
        assert r.columns == 3


class TestOperationCreate:
    """Tests for OperationCreate — validates operation_type length and non-empty inputs."""

    def test_valid_operation(self):
        op = OperationCreate(operation_type="vector_sum", inputs=[[1, 2], [3, 4]])
        assert op.operation_type == "vector_sum"

    def test_type_too_short_raises(self):
        with pytest.raises(ValidationError):
            OperationCreate(operation_type="A", inputs=[[1]])

    def test_empty_inputs_raises(self):
        with pytest.raises(ValidationError):
            OperationCreate(operation_type="vector_sum", inputs=[])

    def test_type_exactly_two_chars_passes(self):
        op = OperationCreate(operation_type="op", inputs=[[1, 2]])
        assert op.operation_type == "op"

    def test_inputs_can_contain_nested_lists(self):
        op = OperationCreate(
            operation_type="matrix_sum",
            inputs=[[[1, 2], [3, 4]], [[5, 6], [7, 8]]],
        )
        assert len(op.inputs) == 2

    def test_inputs_can_contain_scalar(self):
        op = OperationCreate(
            operation_type="vector_scalar",
            inputs=[[1, 2, 3], 5],
        )
        assert op.inputs[1] == 5


class TestOperationResponse:
    """Tests for OperationResponse schema deserialization."""

    def test_valid_response(self):
        r = OperationResponse(
            id=1,
            operation_type="vector_sum",
            inputs=[[1, 2], [3, 4]],
            result=[4, 6],
            status="completed",
        )
        assert r.id == 1
        assert r.status == "completed"

    def test_created_at_optional(self):
        r = OperationResponse(
            id=1,
            operation_type="vector_sum",
            inputs=[[1, 2]],
            result=[1, 2],
            status="completed",
        )
        assert r.created_at is None

    def test_created_at_can_be_set(self):
        now = datetime.now(timezone.utc)
        r = OperationResponse(
            id=1,
            operation_type="dot_product",
            inputs=[[1, 0], [0, 1]],
            result=0.0,
            status="completed",
            created_at=now,
        )
        assert r.created_at == now

    def test_result_can_be_scalar(self):
        r = OperationResponse(
            id=1,
            operation_type="vector_dot",
            inputs=[[1, 0], [0, 1]],
            result=0.0,
            status="completed",
        )
        assert r.result == 0.0

    def test_result_can_be_list(self):
        r = OperationResponse(
            id=1,
            operation_type="vector_sum",
            inputs=[[1, 2, 3], [4, 5, 6]],
            result=[5, 7, 9],
            status="completed",
        )
        assert r.result == [5, 7, 9]
