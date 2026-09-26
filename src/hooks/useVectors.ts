import { useCallback, useEffect, useState } from "react";

import {
  createVector,
  deleteVector,
  getVectors,
  updateVector,
  type VectorPayload,
  type VectorResponse,
} from "../services/vectorService";

export function useVectors() {
  const [vectors, setVectors] = useState<VectorResponse[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadVectors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getVectors();

      setVectors(data);
    } catch (error) {
      console.error("Error cargando vectores:", error);

      setError(
        "No se pudieron cargar los vectores desde la base de datos."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVectors();
  }, [loadVectors]);

  const addVector = async (
    data: VectorPayload
  ) => {
    const created = await createVector(data);

    setVectors((current) => [
      ...current,
      created,
    ]);

    return created;
  };

  const editVector = async (
    id: number,
    data: VectorPayload
  ) => {
    const updated = await updateVector(
      id,
      data
    );

    setVectors((current) =>
      current.map((vector) =>
        vector.id === id
          ? updated
          : vector
      )
    );

    return updated;
  };

  const removeVector = async (
    id: number
  ) => {
    await deleteVector(id);

    setVectors((current) =>
      current.filter(
        (vector) => vector.id !== id
      )
    );
  };

  return {
    vectors,
    loading,
    error,
    loadVectors,
    addVector,
    editVector,
    removeVector,
  };
}