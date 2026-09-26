import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  executeOperation,
  getOperations,
  type OperationPayload,
  type OperationResponse,
} from "../services/operationService";

export function useOperations() {
  const [operations, setOperations] =
    useState<OperationResponse[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadOperations =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getOperations();

        setOperations(data);
      } catch (error) {
        console.error(
          "Error cargando operaciones:",
          error
        );

        setError(
          "No se pudieron cargar las operaciones desde la base de datos."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadOperations();
  }, [loadOperations]);

  const calculate = async (
    data: OperationPayload
  ) => {
    try {
      setLoading(true);
      setError("");

      const operation =
        await executeOperation(data);

      setOperations((current) => [
        operation,
        ...current,
      ]);

      return operation;
    } catch (error) {
      console.error(
        "Error ejecutando operación:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo ejecutar la operación."
      );

      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    operations,
    loading,
    error,
    calculate,
    loadOperations,
  };
}