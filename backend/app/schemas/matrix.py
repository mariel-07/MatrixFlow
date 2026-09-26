from pydantic import BaseModel, Field, model_validator


class MatrixCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: str | None = None
    values: list[list[float]] = Field(..., min_length=1)

    @model_validator(mode="after")
    def validate_matrix(self):
        rows = self.values

        if not rows:
            raise ValueError("La matriz no puede estar vacía")

        columns = len(rows[0])

        if columns == 0:
            raise ValueError("La matriz debe tener al menos una columna")

        if any(len(row) != columns for row in rows):
            raise ValueError("Todas las filas deben tener la misma cantidad de columnas")

        return self


class MatrixResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    values: list[list[float]]

    @property
    def rows(self) -> int:
        return len(self.values)

    @property
    def columns(self) -> int:
        return len(self.values[0]) if self.values else 0