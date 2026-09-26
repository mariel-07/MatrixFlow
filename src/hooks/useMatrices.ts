import { useCallback, useEffect, useState } from "react";

import {
  createMatrix,
  deleteMatrix,
  getMatrices,
  updateMatrix,
  type MatrixPayload,
  type MatrixResponse,
} from "../services/matrixService";

export function useMatrices() {
  const [matrices, setMatrices] = useState<MatrixResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMatrices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMatrices();

      setMatrices(data);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar las matrices.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatrices();
  }, [loadMatrices]);

  const addMatrix = async (data: MatrixPayload) => {
    const created = await createMatrix(data);

    setMatrices((current) => [
      ...current,
      created,
    ]);

    return created;
  };

  const editMatrix = async (
    id: number,
    data: MatrixPayload
  ) => {
    const updated = await updateMatrix(id, data);

    setMatrices((current) =>
      current.map((matrix) =>
        matrix.id === id
          ? updated
          : matrix
      )
    );

    return updated;
  };

  const removeMatrix = async (id: number) => {
    await deleteMatrix(id);

    setMatrices((current) =>
      current.filter((matrix) => matrix.id !== id)
    );
  };

  return {
    matrices,
    loading,
    error,
    loadMatrices,
    addMatrix,
    editMatrix,
    removeMatrix,
  };
}