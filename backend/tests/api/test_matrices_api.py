"""
API integration tests for /api/v1/matrices/ endpoints.

These tests hit the REAL database (Supabase PostgreSQL).
Each test that creates data cleans up after itself.
"""
import uuid
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.security import create_access_token


# ---------------------------------------------------------------------------
# Module-level client and fixtures
# ---------------------------------------------------------------------------

client = TestClient(app)


@pytest.fixture
def admin_headers():
    token = create_access_token(1, "admin_test", "Administrador")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def analista_headers():
    token = create_access_token(2, "analista_test", "Analista")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def consulta_headers():
    token = create_access_token(3, "consulta_test", "Consulta")
    return {"Authorization": f"Bearer {token}"}


def unique_matrix(suffix: str = "") -> dict:
    """Return a valid matrix payload with a unique name to avoid DB conflicts."""
    uid = uuid.uuid4().hex[:8]
    return {
        "name": f"API Test {uid}{suffix}",
        "description": "Created by automated test suite",
        "values": [[1.0, 2.0], [3.0, 4.0]],
    }


# ---------------------------------------------------------------------------
# POST /api/v1/matrices/
# ---------------------------------------------------------------------------

class TestCreateMatrix:
    """Tests for POST /api/v1/matrices/"""

    def test_create_matrix_with_admin_returns_200(self, admin_headers):
        payload = unique_matrix()
        response = client.post("/api/v1/matrices/", json=payload, headers=admin_headers)
        assert response.status_code == 200, f"Unexpected status: {response.text}"
        data = response.json()
        assert "id" in data, "Response must contain 'id'"
        assert data["name"] == payload["name"]
        assert data["values"] == payload["values"]
        # Cleanup
        client.delete(f"/api/v1/matrices/{data['id']}", headers=admin_headers)

    def test_create_matrix_with_analista_returns_200(self, analista_headers, admin_headers):
        payload = unique_matrix()
        response = client.post("/api/v1/matrices/", json=payload, headers=analista_headers)
        assert response.status_code == 200, f"Unexpected status: {response.text}"
        data = response.json()
        assert "id" in data
        # Cleanup
        client.delete(f"/api/v1/matrices/{data['id']}", headers=admin_headers)

    def test_create_matrix_without_token_returns_403(self):
        response = client.post("/api/v1/matrices/", json=unique_matrix())
        assert response.status_code == 403, f"Unexpected status: {response.text}"

    def test_create_matrix_with_consulta_returns_403(self, consulta_headers):
        """Consulta role must not be allowed to create matrices."""
        response = client.post("/api/v1/matrices/", json=unique_matrix(), headers=consulta_headers)
        assert response.status_code == 403, f"Consulta should be forbidden: {response.text}"

    def test_create_matrix_invalid_inconsistent_rows_returns_422(self, admin_headers):
        bad_payload = {"name": "Bad Matrix", "values": [[1, 2], [3]]}
        response = client.post("/api/v1/matrices/", json=bad_payload, headers=admin_headers)
        assert response.status_code == 422, f"Inconsistent rows must be 422: {response.text}"

    def test_create_matrix_name_too_short_returns_422(self, admin_headers):
        bad_payload = {"name": "A", "values": [[1, 2]]}
        response = client.post("/api/v1/matrices/", json=bad_payload, headers=admin_headers)
        assert response.status_code == 422, f"Short name must be 422: {response.text}"

    def test_create_matrix_empty_values_returns_422(self, admin_headers):
        bad_payload = {"name": "Empty Values", "values": []}
        response = client.post("/api/v1/matrices/", json=bad_payload, headers=admin_headers)
        assert response.status_code == 422, f"Empty values must be 422: {response.text}"

    def test_create_matrix_response_has_expected_fields(self, admin_headers):
        payload = unique_matrix()
        response = client.post("/api/v1/matrices/", json=payload, headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        for field in ("id", "name", "values"):
            assert field in data, f"Missing field '{field}' in response"
        # Cleanup
        client.delete(f"/api/v1/matrices/{data['id']}", headers=admin_headers)


# ---------------------------------------------------------------------------
# GET /api/v1/matrices/
# ---------------------------------------------------------------------------

class TestGetAllMatrices:
    """Tests for GET /api/v1/matrices/"""

    def test_get_matrices_with_consulta_returns_200(self, consulta_headers):
        response = client.get("/api/v1/matrices/", headers=consulta_headers)
        assert response.status_code == 200, f"Unexpected status: {response.text}"
        assert isinstance(response.json(), list)

    def test_get_matrices_with_admin_returns_200(self, admin_headers):
        response = client.get("/api/v1/matrices/", headers=admin_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_matrices_with_analista_returns_200(self, analista_headers):
        response = client.get("/api/v1/matrices/", headers=analista_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_matrices_without_token_returns_403(self):
        response = client.get("/api/v1/matrices/")
        assert response.status_code == 403, f"Unexpected status: {response.text}"

    def test_get_matrices_each_item_has_id_name_values(self, consulta_headers, admin_headers):
        payload = unique_matrix()
        create_resp = client.post("/api/v1/matrices/", json=payload, headers=admin_headers)
        assert create_resp.status_code == 200
        matrix_id = create_resp.json()["id"]

        response = client.get("/api/v1/matrices/", headers=consulta_headers)
        assert response.status_code == 200
        matrices = response.json()
        assert len(matrices) > 0
        for m in matrices:
            assert "id" in m and "name" in m and "values" in m

        # Cleanup
        client.delete(f"/api/v1/matrices/{matrix_id}", headers=admin_headers)


# ---------------------------------------------------------------------------
# GET /api/v1/matrices/{id}
# ---------------------------------------------------------------------------

class TestGetMatrixById:
    """Tests for GET /api/v1/matrices/{matrix_id}"""

    def test_get_matrix_by_id_returns_correct_data(self, admin_headers):
        payload = unique_matrix()
        create_resp = client.post("/api/v1/matrices/", json=payload, headers=admin_headers)
        assert create_resp.status_code == 200
        matrix_id = create_resp.json()["id"]

        response = client.get(f"/api/v1/matrices/{matrix_id}", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == matrix_id
        assert data["values"] == payload["values"]

        # Cleanup
        client.delete(f"/api/v1/matrices/{matrix_id}", headers=admin_headers)

    def test_get_matrix_by_id_nonexistent_returns_404(self, admin_headers):
        response = client.get("/api/v1/matrices/999999999", headers=admin_headers)
        assert response.status_code == 404, f"Non-existent ID must return 404: {response.text}"

    def test_get_matrix_by_id_without_token_returns_403(self):
        response = client.get("/api/v1/matrices/1")
        assert response.status_code == 403


# ---------------------------------------------------------------------------
# PUT /api/v1/matrices/{id}
# ---------------------------------------------------------------------------

class TestUpdateMatrix:
    """Tests for PUT /api/v1/matrices/{matrix_id}"""

    def test_update_matrix_with_analista_returns_200(self, analista_headers, admin_headers):
        payload = unique_matrix()
        create_resp = client.post("/api/v1/matrices/", json=payload, headers=admin_headers)
        assert create_resp.status_code == 200
        matrix_id = create_resp.json()["id"]

        updated_payload = {
            "name": "Updated Matrix Name",
            "description": "Updated description",
            "values": [[9.0, 8.0], [7.0, 6.0]],
        }
        update_resp = client.put(
            f"/api/v1/matrices/{matrix_id}",
            json=updated_payload,
            headers=analista_headers,
        )
        assert update_resp.status_code == 200, f"Update failed: {update_resp.text}"
        data = update_resp.json()
        assert data["name"] == "Updated Matrix Name"
        assert data["values"] == [[9.0, 8.0], [7.0, 6.0]]

        # Cleanup
        client.delete(f"/api/v1/matrices/{matrix_id}", headers=admin_headers)

    def test_update_matrix_with_consulta_returns_403(self, admin_headers, consulta_headers):
        payload = unique_matrix()
        create_resp = client.post("/api/v1/matrices/", json=payload, headers=admin_headers)
        assert create_resp.status_code == 200
        matrix_id = create_resp.json()["id"]

        updated_payload = {"name": "Hacked Update", "values": [[1.0]]}
        update_resp = client.put(
            f"/api/v1/matrices/{matrix_id}",
            json=updated_payload,
            headers=consulta_headers,
        )
        assert update_resp.status_code == 403

        # Cleanup
        client.delete(f"/api/v1/matrices/{matrix_id}", headers=admin_headers)

    def test_update_nonexistent_matrix_returns_404(self, admin_headers):
        payload = {"name": "Does Not Exist", "values": [[1.0]]}
        response = client.put("/api/v1/matrices/999999999", json=payload, headers=admin_headers)
        assert response.status_code == 404


# ---------------------------------------------------------------------------
# DELETE /api/v1/matrices/{id}
# ---------------------------------------------------------------------------

class TestDeleteMatrix:
    """Tests for DELETE /api/v1/matrices/{matrix_id}"""

    def test_delete_matrix_with_admin_returns_200(self, admin_headers):
        payload = unique_matrix()
        create_resp = client.post("/api/v1/matrices/", json=payload, headers=admin_headers)
        assert create_resp.status_code == 200
        matrix_id = create_resp.json()["id"]

        delete_resp = client.delete(f"/api/v1/matrices/{matrix_id}", headers=admin_headers)
        assert delete_resp.status_code == 200, f"Delete failed: {delete_resp.text}"
        data = delete_resp.json()
        assert data.get("id") == matrix_id

    def test_delete_matrix_makes_it_unfetchable(self, admin_headers):
        payload = unique_matrix()
        create_resp = client.post("/api/v1/matrices/", json=payload, headers=admin_headers)
        assert create_resp.status_code == 200
        matrix_id = create_resp.json()["id"]

        client.delete(f"/api/v1/matrices/{matrix_id}", headers=admin_headers)
        get_resp = client.get(f"/api/v1/matrices/{matrix_id}", headers=admin_headers)
        assert get_resp.status_code == 404

    def test_delete_matrix_with_consulta_returns_403(self, admin_headers, consulta_headers):
        payload = unique_matrix()
        create_resp = client.post("/api/v1/matrices/", json=payload, headers=admin_headers)
        assert create_resp.status_code == 200
        matrix_id = create_resp.json()["id"]

        delete_resp = client.delete(f"/api/v1/matrices/{matrix_id}", headers=consulta_headers)
        assert delete_resp.status_code == 403

        # Cleanup
        client.delete(f"/api/v1/matrices/{matrix_id}", headers=admin_headers)

    def test_delete_nonexistent_matrix_returns_404(self, admin_headers):
        response = client.delete("/api/v1/matrices/999999999", headers=admin_headers)
        assert response.status_code == 404
