import { useMemo, useState } from "react";
import {
  Calculator,
  CheckCircle2,
  History,
  RotateCcw,
  Sigma,
  XCircle,
} from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import { useMatrices } from "../hooks/useMatrices";
import { useVectors } from "../hooks/useVectors";
import { useOperations } from "../hooks/useOperations";

type Category =
  | "vector"
  | "matrix"
  | "linear";

type Operation =
  | "vector_sum"
  | "vector_subtract"
  | "vector_scalar"
  | "vector_dot"
  | "matrix_sum"
  | "matrix_subtract"
  | "matrix_multiply"
  | "matrix_transpose"
  | "matrix_scalar"
  | "linear_combination";

type ResultValue =
  | number
  | number[]
  | number[][];

interface OperationResult {
  success: boolean;
  message: string;
  value?: ResultValue;
}

export default function Operations() {
  /*
   * ============================================================
   * DATOS REALES DESDE EL BACKEND
   * ============================================================
   */

  const {
    matrices,
    loading: loadingMatrices,
    error: matricesError,
  } = useMatrices();

  const {
    vectors,
    loading: loadingVectors,
    error: vectorsError,
  } = useVectors();

  const {
    calculate,
    loading: loadingOperations,
    error: operationsError,
  } = useOperations();

  /*
   * ============================================================
   * ESTADOS
   * ============================================================
   */

  const [category, setCategory] =
    useState<Category>("vector");

  const [operation, setOperation] =
    useState<Operation>("vector_sum");

  const [firstId, setFirstId] =
    useState("");

  const [secondId, setSecondId] =
    useState("");

  const [scalar, setScalar] =
    useState("2");

  const [result, setResult] =
    useState<OperationResult | null>(null);

  const [history, setHistory] =
    useState<string[]>([]);

  /*
   * ============================================================
   * OPERACIONES DISPONIBLES
   * ============================================================
   */

  const vectorOperations = useMemo(
    () => [
      {
        value: "vector_sum" as Operation,
        label: "Suma de vectores",
      },
      {
        value: "vector_subtract" as Operation,
        label: "Resta de vectores",
      },
      {
        value: "vector_scalar" as Operation,
        label: "Producto por escalar",
      },
      {
        value: "vector_dot" as Operation,
        label: "Producto punto",
      },
    ],
    []
  );

  const matrixOperations = useMemo(
    () => [
      {
        value: "matrix_sum" as Operation,
        label: "Suma de matrices",
      },
      {
        value: "matrix_subtract" as Operation,
        label: "Resta de matrices",
      },
      {
        value: "matrix_multiply" as Operation,
        label: "Multiplicación de matrices",
      },
      {
        value: "matrix_transpose" as Operation,
        label: "Matriz transpuesta",
      },
      {
        value: "matrix_scalar" as Operation,
        label: "Producto por escalar",
      },
    ],
    []
  );

  /*
   * ============================================================
   * CAMBIO DE CATEGORÍA
   * ============================================================
   */

  const handleCategoryChange = (
    value: Category
  ) => {
    setCategory(value);
    setResult(null);

    if (value === "vector") {
      setOperation("vector_sum");

      setFirstId(
        vectors.length > 0
          ? String(vectors[0].id)
          : ""
      );

      setSecondId(
        vectors.length > 1
          ? String(vectors[1].id)
          : ""
      );
    }

    if (value === "matrix") {
      setOperation("matrix_sum");

      setFirstId(
        matrices.length > 0
          ? String(matrices[0].id)
          : ""
      );

      setSecondId(
        matrices.length > 1
          ? String(matrices[1].id)
          : ""
      );
    }

    if (value === "linear") {
      setOperation("linear_combination");

      setFirstId(
        vectors.length > 0
          ? String(vectors[0].id)
          : ""
      );

      setSecondId(
        vectors.length > 1
          ? String(vectors[1].id)
          : ""
      );
    }
  };

  /*
   * ============================================================
   * CÁLCULO
   *
   * IMPORTANTE:
   *
   * Ya NO calculamos aquí con mathOperations.ts.
   *
   * Ahora:
   *
   * React
   *   ↓
   * useOperations()
   *   ↓
   * operationService
   *   ↓
   * FastAPI
   *   ↓
   * Supabase
   * ============================================================
   */

  const handleCalculate = async () => {
    try {
      setResult(null);

      /*
       * --------------------------------------------------------
       * VECTORES
       * --------------------------------------------------------
       */

      if (category === "vector") {
        const vectorA = vectors.find(
          (vector) =>
            Number(vector.id) ===
            Number(firstId)
        );

        const vectorB = vectors.find(
          (vector) =>
            Number(vector.id) ===
            Number(secondId)
        );

        if (!vectorA) {
          throw new Error(
            "No se encontró el primer vector."
          );
        }

        if (
          operation !== "vector_scalar" &&
          !vectorB
        ) {
          throw new Error(
            "No se encontró el segundo vector."
          );
        }

        let response;

        switch (operation) {
          case "vector_sum":
            response = await calculate({
              operation_type: "sum_vector",
              inputs: [
                vectorA.values,
                vectorB!.values,
              ],
            });
            break;

          case "vector_subtract":
            response = await calculate({
              operation_type: "subtract_vector",
              inputs: [
                vectorA.values,
                vectorB!.values,
              ],
            });
            break;

          case "vector_scalar":
            response = await calculate({
              operation_type: "scalar_multiply",
              inputs: [
                Number(scalar),
                vectorA.values,
              ],
            });
            break;

          case "vector_dot":
            response = await calculate({
              operation_type: "dot_product",
              inputs: [
                vectorA.values,
                vectorB!.values,
              ],
            });
            break;

          default:
            throw new Error(
              "Operación de vector no válida."
            );
        }

        const calculated =
          response.result as ResultValue;

        setResult({
          success: true,
          message:
            "Operación realizada correctamente y guardada en la base de datos.",
          value: calculated,
        });
      }

      /*
       * --------------------------------------------------------
       * MATRICES
       * --------------------------------------------------------
       */

      else if (category === "matrix") {
        const matrixA = matrices.find(
          (matrix) =>
            Number(matrix.id) ===
            Number(firstId)
        );

        const matrixB = matrices.find(
          (matrix) =>
            Number(matrix.id) ===
            Number(secondId)
        );

        if (!matrixA) {
          throw new Error(
            "No se encontró la primera matriz."
          );
        }

        if (
          operation !== "matrix_scalar" &&
          operation !== "matrix_transpose" &&
          !matrixB
        ) {
          throw new Error(
            "No se encontró la segunda matriz."
          );
        }

        let response;

        switch (operation) {
          case "matrix_sum":
            response = await calculate({
              operation_type: "add_matrix",
              inputs: [
                matrixA.values,
                matrixB!.values,
              ],
            });
            break;

          case "matrix_subtract":
            response = await calculate({
              operation_type:
                "subtract_matrix",
              inputs: [
                matrixA.values,
                matrixB!.values,
              ],
            });
            break;

          case "matrix_multiply":
            response = await calculate({
              operation_type:
                "multiply_matrix",
              inputs: [
                matrixA.values,
                matrixB!.values,
              ],
            });
            break;

          case "matrix_transpose":
            response = await calculate({
              operation_type:
                "transpose_matrix",
              inputs: [matrixA.values],
            });
            break;

          case "matrix_scalar":
            response = await calculate({
              operation_type:
                "scalar_multiply_matrix",
              inputs: [
                Number(scalar),
                matrixA.values,
              ],
            });
            break;

          default:
            throw new Error(
              "Operación de matriz no válida."
            );
        }

        const calculated =
          response.result as ResultValue;

        setResult({
          success: true,
          message:
            "Operación realizada correctamente y guardada en la base de datos.",
          value: calculated,
        });
      }

      /*
       * --------------------------------------------------------
       * COMBINACIÓN LINEAL
       * --------------------------------------------------------
       *
       * Usa los vectores reales que vienen de la BD.
       *
       * Ejemplo:
       *
       * 2·V1 + 3·V2
       *
       * inputs[0] = vectores
       * inputs[1] = coeficientes
       * --------------------------------------------------------
       */

      else {
        const vectorA = vectors.find(
          (vector) =>
            Number(vector.id) ===
            Number(firstId)
        );

        const vectorB = vectors.find(
          (vector) =>
            Number(vector.id) ===
            Number(secondId)
        );

        if (!vectorA || !vectorB) {
          throw new Error(
            "Selecciona dos vectores para realizar la combinación lineal."
          );
        }

        const response = await calculate({
          operation_type:
            "linear_combination",
          inputs: [
            [
              vectorA.values,
              vectorB.values,
            ],
            [2, 3],
          ],
        });

        const calculated =
          response.result as ResultValue;

        setResult({
          success: true,
          message:
            "Combinación lineal realizada correctamente y guardada en la base de datos.",
          value: calculated,
        });
      }

      /*
       * --------------------------------------------------------
       * HISTORIAL VISUAL DE LA SESIÓN
       * --------------------------------------------------------
       */

      const operationLabel =
        getOperationLabel(operation);

      setHistory((current) => [
        `${operationLabel} — ${new Date().toLocaleTimeString(
          "es-PE"
        )}`,
        ...current,
      ]);
    } catch (error) {
      console.error(error);

      setResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "No fue posible realizar la operación.",
      });
    }
  };

  /*
   * ============================================================
   * REINICIAR
   * ============================================================
   */

  const resetOperation = () => {
    setResult(null);
    setHistory([]);
    setScalar("2");
  };

  /*
   * ============================================================
   * OPERACIONES SEGÚN CATEGORÍA
   * ============================================================
   */

  const operations =
    category === "vector"
      ? vectorOperations
      : category === "matrix"
        ? matrixOperations
        : [
            {
              value:
                "linear_combination" as Operation,
              label: "Combinación lineal",
            },
          ];

  /*
   * ============================================================
   * ESTADO DE CARGA
   * ============================================================
   */

  const loading =
    loadingMatrices ||
    loadingVectors ||
    loadingOperations;

  const generalError =
    matricesError ||
    vectorsError ||
    operationsError;

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operaciones Matemáticas"
        description="Ejecuta operaciones con vectores, matrices y combinaciones lineales"
        action={
          <button
            onClick={resetOperation}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw size={17} />
            Reiniciar
          </button>
        }
      />

      {/* ======================================================
          ERROR DE CONEXIÓN
          ====================================================== */}

      {generalError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <XCircle
              className="mt-0.5 text-red-600"
              size={21}
            />

            <div>
              <p className="font-semibold text-red-900">
                Error al cargar los datos
              </p>

              <p className="mt-1 text-sm text-red-700">
                {generalError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          CARGANDO
          ====================================================== */}

      {loading && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-700">
            Cargando datos desde la base de datos...
          </p>
        </div>
      )}

      {/* ======================================================
          CATEGORÍAS
          ====================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          onClick={() =>
            handleCategoryChange("vector")
          }
          className={`rounded-xl border p-5 text-left transition ${
            category === "vector"
              ? "border-blue-500 bg-blue-50"
              : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <Calculator
            className="mb-3 text-blue-600"
            size={24}
          />

          <p className="font-semibold text-slate-900">
            Vectores
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Suma, resta, escalar y producto punto.
          </p>
        </button>

        <button
          onClick={() =>
            handleCategoryChange("matrix")
          }
          className={`rounded-xl border p-5 text-left transition ${
            category === "matrix"
              ? "border-cyan-500 bg-cyan-50"
              : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <Sigma
            className="mb-3 text-cyan-600"
            size={24}
          />

          <p className="font-semibold text-slate-900">
            Matrices
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Operaciones matriciales y transpuesta.
          </p>
        </button>

        <button
          onClick={() =>
            handleCategoryChange("linear")
          }
          className={`rounded-xl border p-5 text-left transition ${
            category === "linear"
              ? "border-violet-500 bg-violet-50"
              : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <Sigma
            className="mb-3 text-violet-600"
            size={24}
          />

          <p className="font-semibold text-slate-900">
            Combinaciones lineales
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Combina vectores mediante escalares.
          </p>
        </button>
      </div>

      {/* ======================================================
          CONTENIDO
          ====================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        {/* PANEL PRINCIPAL */}

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              Configuración de operación
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Selecciona los elementos que deseas
              procesar.
            </p>
          </div>

          <div className="space-y-5 p-5">
            {/* OPERACIÓN */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Operación
              </label>

              <select
                value={operation}
                onChange={(event) =>
                  setOperation(
                    event.target.value as Operation
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {operations.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ==================================================
                PRIMER VECTOR / MATRIZ
                ================================================== */}

            {category !== "linear" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {category === "vector"
                    ? "Primer vector"
                    : "Primera matriz"}
                </label>

                <select
                  value={firstId}
                  onChange={(event) =>
                    setFirstId(
                      event.target.value
                    )
                  }
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="">
                    Seleccionar...
                  </option>

                  {category === "vector"
                    ? vectors.map((vector) => (
                        <option
                          key={vector.id}
                          value={vector.id}
                        >
                          {vector.name}
                        </option>
                      ))
                    : matrices.map((matrix) => (
                        <option
                          key={matrix.id}
                          value={matrix.id}
                        >
                          {matrix.name}
                        </option>
                      ))}
                </select>
              </div>
            )}

            {/* ==================================================
                SEGUNDO VECTOR / MATRIZ
                ================================================== */}

            {category !== "linear" &&
              !operation.includes("scalar") &&
              !operation.includes("transpose") && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {category === "vector"
                      ? "Segundo vector"
                      : "Segunda matriz"}
                  </label>

                  <select
                    value={secondId}
                    onChange={(event) =>
                      setSecondId(
                        event.target.value
                      )
                    }
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  >
                    <option value="">
                      Seleccionar...
                    </option>

                    {category === "vector"
                      ? vectors.map((vector) => (
                          <option
                            key={vector.id}
                            value={vector.id}
                          >
                            {vector.name}
                          </option>
                        ))
                      : matrices.map((matrix) => (
                          <option
                            key={matrix.id}
                            value={matrix.id}
                          >
                            {matrix.name}
                          </option>
                        ))}
                  </select>
                </div>
              )}

            {/* ==================================================
                COMBINACIÓN LINEAL
                ================================================== */}

            {category === "linear" && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Primer vector
                  </label>

                  <select
                    value={firstId}
                    onChange={(event) =>
                      setFirstId(
                        event.target.value
                      )
                    }
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-100"
                  >
                    <option value="">
                      Seleccionar vector...
                    </option>

                    {vectors.map((vector) => (
                      <option
                        key={vector.id}
                        value={vector.id}
                      >
                        {vector.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Segundo vector
                  </label>

                  <select
                    value={secondId}
                    onChange={(event) =>
                      setSecondId(
                        event.target.value
                      )
                    }
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-100"
                  >
                    <option value="">
                      Seleccionar vector...
                    </option>

                    {vectors.map((vector) => (
                      <option
                        key={vector.id}
                        value={vector.id}
                      >
                        {vector.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-lg border border-violet-100 bg-violet-50 p-4">
                  <p className="text-sm font-medium text-violet-900">
                    Combinación lineal
                  </p>

                  <p className="mt-1 text-sm text-violet-700">
                    Se utilizarán los vectores
                    seleccionados y los escalares:
                  </p>

                  <p className="mt-2 font-mono text-sm font-semibold text-violet-900">
                    2 · V₁ + 3 · V₂
                  </p>

                  <p className="mt-2 text-xs text-violet-600">
                    El cálculo se realiza en el
                    backend y queda registrado en
                    Supabase.
                  </p>
                </div>
              </>
            )}

            {/* ==================================================
                ESCALAR
                ================================================== */}

            {operation.includes("scalar") && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Escalar
                </label>

                <input
                  type="number"
                  value={scalar}
                  onChange={(event) =>
                    setScalar(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            )}

            {/* ==================================================
                BOTÓN CALCULAR
                ================================================== */}

            <button
              onClick={handleCalculate}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Calculator size={18} />

              {loadingOperations
                ? "Calculando..."
                : "Calcular operación"}
            </button>
          </div>
        </div>

        {/* ======================================================
            HISTORIAL
            ====================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 p-5">
            <History
              size={19}
              className="text-slate-500"
            />

            <div>
              <h2 className="font-semibold text-slate-900">
                Sesión actual
              </h2>

              <p className="text-xs text-slate-500">
                Operaciones ejecutadas
              </p>
            </div>
          </div>

          <div className="p-5">
            {history.length === 0 ? (
              <p className="text-center text-sm text-slate-400">
                Todavía no se han ejecutado
                operaciones.
              </p>
            ) : (
              <div className="space-y-2">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================
          RESULTADO
          ====================================================== */}

      {result && (
        <div
          className={`rounded-xl border p-5 ${
            result.success
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle2
                className="mt-0.5 text-emerald-600"
                size={22}
              />
            ) : (
              <XCircle
                className="mt-0.5 text-red-600"
                size={22}
              />
            )}

            <div className="min-w-0 flex-1">
              <p
                className={`font-semibold ${
                  result.success
                    ? "text-emerald-900"
                    : "text-red-900"
                }`}
              >
                {result.message}
              </p>

              {result.success &&
                result.value !== undefined && (
                  <div className="mt-4 overflow-x-auto">
                    <ResultRenderer
                      value={result.value}
                    />
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/*
 * ============================================================
 * MOSTRAR RESULTADOS
 * ============================================================
 */

function ResultRenderer({
  value,
}: {
  value: ResultValue;
}) {
  if (typeof value === "number") {
    return (
      <div className="text-3xl font-bold text-emerald-700">
        {value.toLocaleString("es-PE")}
      </div>
    );
  }

  if (
    Array.isArray(value) &&
    (value.length === 0 ||
      typeof value[0] === "number")
  ) {
    return (
      <div className="flex flex-wrap gap-2">
        {(value as number[]).map(
          (item, index) => (
            <div
              key={index}
              className="rounded-lg border border-emerald-200 bg-white px-5 py-3 shadow-sm"
            >
              <span className="mr-2 text-xs text-slate-400">
                {index + 1}
              </span>

              <span className="font-bold text-emerald-700">
                {item}
              </span>
            </div>
          )
        )}
      </div>
    );
  }

  return (
    <div className="inline-block rounded-xl border border-emerald-200 bg-white p-4">
      {(value as number[][]).map(
        (row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex gap-2"
          >
            {row.map(
              (item, columnIndex) => (
                <div
                  key={columnIndex}
                  className="mb-2 flex h-12 w-16 items-center justify-center rounded-lg bg-slate-50 font-semibold text-emerald-700"
                >
                  {item}
                </div>
              )
            )}
          </div>
        )
      )}
    </div>
  );
}

/*
 * ============================================================
 * NOMBRES DE OPERACIONES
 * ============================================================
 */

function getOperationLabel(
  operation: Operation
): string {
  const labels: Record<
    Operation,
    string
  > = {
    vector_sum: "Suma de vectores",
    vector_subtract:
      "Resta de vectores",
    vector_scalar:
      "Producto de vector por escalar",
    vector_dot: "Producto punto",

    matrix_sum: "Suma de matrices",
    matrix_subtract:
      "Resta de matrices",
    matrix_multiply:
      "Multiplicación de matrices",
    matrix_transpose:
      "Matriz transpuesta",
    matrix_scalar:
      "Producto de matriz por escalar",

    linear_combination:
      "Combinación lineal",
  };

  return labels[operation];
}
