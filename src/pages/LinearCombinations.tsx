import { useEffect, useMemo, useState } from "react";
import { useVectors } from "../hooks/useVectors";
import { useOperations } from "../hooks/useOperations";

interface SelectedVector {
    vectorId: number;
    scalar: number;
}

export default function LinearCombinations() {
    /*
     * ============================================================
     * PUNTO 18 - COMBINACIONES LINEALES
     *
     * Los vectores vienen del BACKEND.
     *
     * NO se utiliza:
     * import { initialVectors } from "../data/mathMockData";
     *
     * NO se utiliza:
     * useState<Vector[]>(initialVectors);
     * ============================================================
     */
    const {
        vectors,
        loading: vectorsLoading,
        error: vectorsError,
    } = useVectors();

    /*
     * Las operaciones se ejecutan en el BACKEND.
     *
     * El frontend NO realiza el cálculo matemático.
     */
    const {
        calculate,
        loading: operationLoading,
    } = useOperations();

    const [selectedVectors, setSelectedVectors] =
        useState<SelectedVector[]>([]);

    const [result, setResult] =
        useState<number[] | null>(null);

    const [error, setError] =
        useState("");

    /*
     * ============================================================
     * Seleccionar automáticamente el primer vector
     * cuando los vectores llegan desde el backend.
     * ============================================================
     */
    useEffect(() => {
        if (
            vectors.length > 0 &&
            selectedVectors.length === 0
        ) {
            setSelectedVectors([
                {
                    vectorId: vectors[0].id,
                    scalar: 1,
                },
            ]);
        }
    }, [vectors, selectedVectors.length]);

    /*
     * ============================================================
     * Obtener los datos completos de los vectores seleccionados.
     * ============================================================
     */
    const selectedVectorData = useMemo(() => {
        return selectedVectors.map((item) => ({
            ...item,
            vector: vectors.find(
                (vector) =>
                    vector.id === item.vectorId
            ),
        }));
    }, [selectedVectors, vectors]);

    /*
     * ============================================================
     * AGREGAR VECTOR
     * ============================================================
     */
    const addVector = () => {
        const availableVector = vectors.find(
            (vector) =>
                !selectedVectors.some(
                    (selected) =>
                        selected.vectorId === vector.id
                )
        );

        if (!availableVector) {
            setError(
                "No hay más vectores disponibles para seleccionar."
            );
            return;
        }

        setSelectedVectors((current) => [
            ...current,
            {
                vectorId: availableVector.id,
                scalar: 1,
            },
        ]);

        setError("");
        setResult(null);
    };

    /*
     * ============================================================
     * ELIMINAR VECTOR
     * ============================================================
     */
    const removeVector = (index: number) => {
        if (selectedVectors.length === 1) {
            setError(
                "Debes mantener al menos un vector."
            );
            return;
        }

        setSelectedVectors((current) =>
            current.filter(
                (_, currentIndex) =>
                    currentIndex !== index
            )
        );

        setError("");
        setResult(null);
    };

    /*
     * ============================================================
     * ACTUALIZAR VECTOR O COEFICIENTE
     * ============================================================
     */
    const updateVector = (
        index: number,
        field: "vectorId" | "scalar",
        value: number
    ) => {
        setSelectedVectors((current) =>
            current.map(
                (item, currentIndex) =>
                    currentIndex === index
                        ? {
                              ...item,
                              [field]: value,
                          }
                        : item
            )
        );

        setError("");
        setResult(null);
    };

    /*
     * ============================================================
     * PUNTO 18 - CALCULAR COMBINACIÓN LINEAL
     * ============================================================
     *
     * IMPORTANTE:
     *
     * El cálculo NO se realiza en React.
     *
     * React únicamente prepara los datos y los envía al backend.
     *
     * Formato obligatorio:
     *
     * {
     *     operation_type: "linear_combination",
     *     inputs: [
     *         [
     *             [1, 2, 3],
     *             [4, 5, 6]
     *         ],
     *         [2, 3]
     *     ]
     * }
     *
     * inputs[0] = vectores
     * inputs[1] = coeficientes
     *
     * El backend recibe esos datos y ejecuta:
     *
     * linear_combination(
     *     data.inputs[0],
     *     data.inputs[1]
     * )
     * ============================================================
     */
    const calculateCombination = async () => {
        setError("");
        setResult(null);

        /*
         * Debe existir al menos un vector.
         */
        if (selectedVectors.length === 0) {
            setError(
                "Debes seleccionar al menos un vector."
            );
            return;
        }

        /*
         * Obtener los vectores seleccionados
         * desde los datos provenientes del backend.
         */
        const selected = selectedVectorData;

        /*
         * Verificar que todos los vectores seleccionados
         * existan realmente.
         */
        if (
            selected.some(
                (item) => !item.vector
            )
        ) {
            setError(
                "Uno de los vectores seleccionados no es válido."
            );
            return;
        }

        /*
         * ========================================================
         * OBTENER DIMENSIONES
         * ========================================================
         */
        const dimensions = selected.map(
            (item) =>
                item.vector!.values.length
        );

        /*
         * Todos los vectores deben tener
         * exactamente la misma dimensión.
         */
        const sameDimension =
            dimensions.every(
                (dimension) =>
                    dimension === dimensions[0]
            );

        if (!sameDimension) {
            setError(
                "Todos los vectores deben tener la misma dimensión para realizar una combinación lineal."
            );
            return;
        }

        try {
            /*
             * ====================================================
             * inputs[0] = VECTORES
             *
             * Los valores vienen directamente de los vectores
             * obtenidos mediante useVectors().
             *
             * Ejemplo:
             *
             * [
             *     [1, 2, 3],
             *     [4, 5, 6]
             * ]
             * ====================================================
             */
            const vectorValues =
                selected.map(
                    ({ vector }) =>
                        vector!.values
                );

            /*
             * ====================================================
             * inputs[1] = COEFICIENTES
             *
             * Ejemplo:
             *
             * [2, 3]
             * ====================================================
             */
            const coefficients =
                selected.map(
                    ({ scalar }) =>
                        scalar
                );

            /*
             * ====================================================
             * ENVIAR AL BACKEND
             *
             * Formato EXACTO requerido por el punto 18:
             *
             * {
             *     operation_type:
             *         "linear_combination",
             *
             *     inputs: [
             *         vectorValues,
             *         coefficients
             *     ]
             * }
             *
             * NO se realiza el cálculo aquí.
             * ====================================================
             */
            const operation =
                await calculate({
                    operation_type:
                        "linear_combination",

                    inputs: [
                        vectorValues,
                        coefficients,
                    ],
                });

            /*
             * ====================================================
             * RESULTADO DEL BACKEND
             * ====================================================
             */
            if (
                Array.isArray(
                    operation.result
                )
            ) {
                setResult(
                    operation.result.map(
                        Number
                    )
                );
            } else {
                setError(
                    "El backend no devolvió un resultado válido."
                );
            }
        } catch (err) {
            console.error(
                "Error al calcular la combinación lineal:",
                err
            );

            setError(
                "No se pudo calcular la combinación lineal."
            );
        }
    };

    /*
     * ============================================================
     * FORMATEAR NÚMEROS
     * ============================================================
     */
    const formatNumber = (
        value: number
    ) => {
        if (Number.isInteger(value)) {
            return value.toString();
        }

        return value.toFixed(2);
    };

    /*
     * ============================================================
     * CARGANDO VECTORES
     * ============================================================
     */
    if (vectorsLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Combinaciones lineales
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Cargando vectores...
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <p className="text-sm text-slate-500">
                        Cargando vectores desde el backend...
                    </p>
                </div>
            </div>
        );
    }

    /*
     * ============================================================
     * ERROR AL CARGAR VECTORES
     * ============================================================
     */
    if (vectorsError) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Combinaciones lineales
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Combina vectores mediante escalares para obtener un nuevo
                        vector.
                    </p>
                </div>

                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {vectorsError}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Combinaciones lineales
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Combina vectores mediante escalares para obtener un nuevo
                    vector.
                </p>
            </div>

            {/* Formula */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm font-medium text-blue-900">
                    Combinación lineal
                </p>

                <p className="mt-2 text-lg font-semibold text-blue-700">
                    a₁V₁ + a₂V₂ + ... + aₙVₙ
                </p>

                <p className="mt-2 text-sm text-blue-700">
                    Todos los vectores deben tener la misma dimensión.
                </p>
            </div>

            {/* Sin vectores */}
            {vectors.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
                    <p className="font-medium text-amber-900">
                        No hay vectores disponibles.
                    </p>

                    <p className="mt-1 text-sm text-amber-700">
                        Primero debes registrar vectores.
                    </p>
                </div>
            ) : (
                <>
                    {/* Selección de vectores */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    Vectores seleccionados
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Define el vector y el escalar correspondiente.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={addVector}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                                + Agregar vector
                            </button>
                        </div>

                        <div className="space-y-4 p-6">
                            {selectedVectors.map(
                                (
                                    selected,
                                    index
                                ) => {
                                    const vector =
                                        vectors.find(
                                            (item) =>
                                                item.id ===
                                                selected.vectorId
                                        );

                                    return (
                                        <div
                                            key={`${selected.vectorId}-${index}`}
                                            className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_180px_auto]"
                                        >
                                            {/* Vector */}
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                                    Vector{" "}
                                                    {index + 1}
                                                </label>

                                                <select
                                                    value={
                                                        selected.vectorId
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateVector(
                                                            index,
                                                            "vectorId",
                                                            Number(
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                >
                                                    {vectors.map(
                                                        (
                                                            item
                                                        ) => (
                                                            <option
                                                                key={
                                                                    item.id
                                                                }
                                                                value={
                                                                    item.id
                                                                }
                                                            >
                                                                {
                                                                    item.name
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>

                                                {vector && (
                                                    <p className="mt-1.5 text-xs text-slate-400">
                                                        Dimensión:{" "}
                                                        {
                                                            vector
                                                                .values
                                                                .length
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            {/* Coeficiente */}
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                                    Coeficiente
                                                </label>

                                                <input
                                                    type="number"
                                                    value={
                                                        selected.scalar
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateVector(
                                                            index,
                                                            "scalar",
                                                            Number(
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                />
                                            </div>

                                            {/* Eliminar */}
                                            <div className="flex items-end">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeVector(
                                                            index
                                                        )
                                                    }
                                                    className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>

                        {/* Calcular */}
                        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
                            <button
                                type="button"
                                onClick={
                                    calculateCombination
                                }
                                disabled={
                                    operationLoading
                                }
                                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {operationLoading
                                    ? "Calculando..."
                                    : "Calcular combinación"}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Resultado */}
                    {result && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 shadow-sm">
                            <div className="border-b border-emerald-200 px-6 py-4">
                                <h2 className="font-semibold text-emerald-900">
                                    Resultado
                                </h2>

                                <p className="mt-1 text-sm text-emerald-700">
                                    Vector obtenido mediante la combinación lineal.
                                </p>
                            </div>

                            <div className="p-6">
                                <div className="flex flex-wrap items-center gap-2">
                                    {result.map(
                                        (
                                            value,
                                            index
                                        ) => (
                                            <span
                                                key={
                                                    index
                                                }
                                                className="rounded-lg border border-emerald-200 bg-white px-4 py-3 text-lg font-semibold text-emerald-800"
                                            >
                                                {formatNumber(
                                                    value
                                                )}
                                            </span>
                                        )
                                    )}
                                </div>

                                <div className="mt-5 rounded-lg bg-white p-4">
                                    <p className="text-sm font-medium text-slate-700">
                                        Expresión utilizada
                                    </p>

                                    <p className="mt-2 text-sm text-slate-600">
                                        {selectedVectorData
                                            .map(
                                                ({
                                                    vector,
                                                    scalar,
                                                }) =>
                                                    `${formatNumber(
                                                        scalar
                                                    )} × ${
                                                        vector?.name ??
                                                        "Vector desconocido"
                                                    }`
                                            )
                                            .join(
                                                " + "
                                            )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
