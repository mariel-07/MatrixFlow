import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def admin_token():
    return create_access_token(user_id=1, username="admin_test", role="Administrador")


@pytest.fixture
def analista_token():
    return create_access_token(user_id=2, username="analista_test", role="Analista")


@pytest.fixture
def consulta_token():
    return create_access_token(user_id=3, username="consulta_test", role="Consulta")


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def analista_headers(analista_token):
    return {"Authorization": f"Bearer {analista_token}"}


@pytest.fixture
def consulta_headers(consulta_token):
    return {"Authorization": f"Bearer {consulta_token}"}


MATRIX_2X2 = {"name": "Test Matrix", "description": "Test", "values": [[1, 2], [3, 4]]}
MATRIX_2X2_B = {"name": "Test Matrix B", "description": "Test B", "values": [[5, 6], [7, 8]]}
VECTOR_3D = {"name": "Test Vector", "description": "Test", "values": [1.0, 2.0, 3.0]}
VECTOR_3D_B = {"name": "Test Vector B", "description": "Test B", "values": [4.0, 5.0, 6.0]}
