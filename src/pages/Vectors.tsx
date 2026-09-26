import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Calculator,
  Check,
  CheckCircle2,
  Database,
  Eye,
  Layers,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react'

import PageHeader from '../components/common/PageHeader'
import Modal from '../components/common/Modal'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

// ============================================================
// TIPOS
// ============================================================

interface VectorItem {
  id: number
  name: string
  description?: string | null
  values: number[]
}

interface SaleDetailItem {
  id?: number
  product_id: number
  product_name?: string
  quantity: number
  unit_price: number
}

interface SaleItem {
  id: number
  branch_id: number
  branch_name?: string
  total: number
  details?: SaleDetailItem[]
}

interface InventoryItem {
  id: number
  product_id: number
  branch_id: number
  quantity: number
  product_name?: string
  branch_name?: string
}

interface TargetItem {
  target_id: number
  branch_id: number
  branch: string
  target: string
  target_value: number
  sales: number
  compliance_percentage: number
  status?: string
}

interface ProcessingIndicators {
  total_operations: number
  completed_operations: number
  error_operations: number
  success_rate: number
  avg_execution_time_ms: number
  matrix_operations: number
  vector_operations: number
  linear_combinations: number
  engine_status: string
  active_modules: number
  last_processed_at?: string
}

type VectorCategory =
  | 'Ventas'
  | 'Inventario'
  | 'Metas'
  | 'Indicadores'

type DataSource =
  | 'Ventas'
  | 'Inventario'
  | 'Metas'
  | 'Indicadores'

interface SourceRecord {
  id: number
  title: string
  description: string
  value: number
}

// ============================================================
// CATEGORÍAS
// ============================================================

const categories: VectorCategory[] = [
  'Ventas',
  'Inventario',
  'Metas',
  'Indicadores',
]

const categoryConfig: Record<
  VectorCategory,
  {
    description: string
    icon: typeof ShoppingCart
    color: string
    bg: string
  }
> = {
  Ventas: {
    description:
      'Vectores generados desde las operaciones comerciales.',
    icon: ShoppingCart,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },

  Inventario: {
    description:
      'Vectores asociados al comportamiento del inventario.',
    icon: Package,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },

  Metas: {
    description:
      'Vectores asociados a objetivos empresariales.',
    icon: BarChart3,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },

  Indicadores: {
    description:
      'Vectores utilizados para indicadores empresariales.',
    icon: Calculator,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
}

// ============================================================
// DETERMINAR CATEGORÍA DEL VECTOR
// ============================================================

function getVectorCategory(
  vector: VectorItem
): VectorCategory {
  const text =
    `${vector.name} ${vector.description ?? ''}`.toLowerCase()

  if (
    text.includes('inventario') ||
    text.includes('stock')
  ) {
    return 'Inventario'
  }

  if (
    text.includes('meta') ||
    text.includes('objetivo')
  ) {
    return 'Metas'
  }

  if (
    text.includes('indicador') ||
    text.includes('kpi') ||
    text.includes('operaciones totales') ||
    text.includes('operaciones completadas') ||
    text.includes('operaciones con error') ||
    text.includes('tasa de éxito') ||
    text.includes('tiempo promedio') ||
    text.includes('operaciones matriciales') ||
    text.includes('operaciones vectoriales') ||
    text.includes('combinaciones lineales') ||
    text.includes('módulos activos')
  ) {
    return 'Indicadores'
  }

  return 'Ventas'
}

// ============================================================
// COMPONENTE
// ============================================================

export default function Vectors() {
  const { hasRole } = useAuth()

  const canEdit = hasRole([
    'Administrador',
    'Analista',
  ])

  // ----------------------------------------------------------
  // DATOS
  // ----------------------------------------------------------

  const [vectorList, setVectorList] =
    useState<VectorItem[]>([])

  const [sales, setSales] =
    useState<SaleItem[]>([])

  const [inventoryList, setInventoryList] =
    useState<InventoryItem[]>([])

  const [targets, setTargets] =
    useState<TargetItem[]>([])

  const [processing, setProcessing] =
    useState<ProcessingIndicators | null>(null)

  // ----------------------------------------------------------
  // ESTADOS
  // ----------------------------------------------------------

  const [loading, setLoading] =
    useState(true)

  const [loadingSales, setLoadingSales] =
    useState(false)

  const [loadingInventory, setLoadingInventory] =
    useState(false)

  const [loadingTargets, setLoadingTargets] =
    useState(false)

  const [loadingIndicators, setLoadingIndicators] =
    useState(false)

  const [submitting, setSubmitting] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null)

  // ----------------------------------------------------------
  // FILTROS
  // ----------------------------------------------------------

  const [search, setSearch] =
    useState('')

  const [activeCategory, setActiveCategory] =
    useState<VectorCategory>('Ventas')

  // ----------------------------------------------------------
  // VECTOR SELECCIONADO
  // ----------------------------------------------------------

  const [selectedVector, setSelectedVector] =
    useState<VectorItem | null>(null)

  // ----------------------------------------------------------
  // MODAL
  // ----------------------------------------------------------

  const [isModalOpen, setIsModalOpen] =
    useState(false)

  const [dataSource, setDataSource] =
    useState<DataSource>('Ventas')

  const [selectedSourceIds, setSelectedSourceIds] =
    useState<number[]>([])

  const [sourceSearch, setSourceSearch] =
    useState('')

  // ==========================================================
  // CARGAR VECTORES
  // ==========================================================

  const loadVectors = async () => {
    try {
      const response =
        await api.get<VectorItem[]>(
          '/api/v1/vectors/'
        )

      const data =
        Array.isArray(response.data)
          ? response.data
          : []

      setVectorList(data)

      if (
        data.length > 0 &&
        !selectedVector
      ) {
        setSelectedVector(data[0])
      }
    } catch (err: any) {
      console.error(
        'Error cargando vectores:',
        err
      )

      setError(
        err?.response?.data?.detail ||
          'No se pudieron cargar los vectores empresariales.'
      )
    }
  }

  // ==========================================================
  // CARGAR VENTAS
  // ==========================================================

  const loadSales = async () => {
    try {
      setLoadingSales(true)

      const response =
        await api.get<SaleItem[]>(
          '/api/v1/sales/'
        )

      console.log(
        'VENTAS PARA VECTORES:',
        response.data
      )

      const data =
        Array.isArray(response.data)
          ? response.data
          : []

      setSales(data)
    } catch (err: any) {
      console.error(
        'Error cargando ventas para vectores:',
        err
      )

      setSales([])

      console.error(
        'Respuesta ventas:',
        err?.response?.data
      )
    } finally {
      setLoadingSales(false)
    }
  }

  // ==========================================================
  // CARGAR INVENTARIO
  // ==========================================================

  const loadInventory = async () => {
    try {
      setLoadingInventory(true)

      const response =
        await api.get<InventoryItem[]>(
          '/api/v1/inventory/'
        )

      console.log(
        'INVENTARIO PARA VECTORES:',
        response.data
      )

      const data =
        Array.isArray(response.data)
          ? response.data
          : []

      setInventoryList(data)
    } catch (err: any) {
      console.error(
        'Error cargando inventario para vectores:',
        err
      )

      console.error(
        'Respuesta inventario:',
        err?.response?.data
      )

      setInventoryList([])
    } finally {
      setLoadingInventory(false)
    }
  }

  // ==========================================================
  // CARGAR METAS
  // ==========================================================

  const loadTargets = async () => {
    try {
      setLoadingTargets(true)

      const response =
        await api.get('/api/v1/reports/')

      const sections =
        Array.isArray(response.data?.data)
          ? response.data.data
          : []

      const targetSection =
        sections.find(
          (section: any) =>
            section.module ===
            'target_compliance'
        )

      const data =
        Array.isArray(targetSection?.data)
          ? targetSection.data
          : []

      console.log(
        'METAS PARA VECTORES:',
        data
      )

      setTargets(data)
    } catch (err: any) {
      console.error(
        'Error cargando metas para vectores:',
        err
      )

      setTargets([])
    } finally {
      setLoadingTargets(false)
    }
  }

  // ==========================================================
  // CARGAR INDICADORES
  // ==========================================================

  const loadProcessingIndicators = async () => {
    try {
      setLoadingIndicators(true)

      const response =
        await api.get('/api/v1/reports/')

      const sections =
        Array.isArray(response.data?.data)
          ? response.data.data
          : []

      const processingSection =
        sections.find(
          (section: any) =>
            section.module ===
            'processing_indicators'
        )

      const data =
        processingSection?.data ?? null

      console.log(
        'INDICADORES PARA VECTORES:',
        data
      )

      setProcessing(data)
    } catch (err: any) {
      console.error(
        'Error cargando indicadores para vectores:',
        err
      )

      setProcessing(null)
    } finally {
      setLoadingIndicators(false)
    }
  }

  // ==========================================================
  // CARGAR TODO
  // ==========================================================

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      await loadVectors()

      await Promise.all([
        loadSales(),
        loadInventory(),
        loadTargets(),
        loadProcessingIndicators(),
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // ==========================================================
  // VECTORES FILTRADOS
  // ==========================================================

  const filteredVectors = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase()

    return vectorList.filter(
      (vector) => {
        const category =
          getVectorCategory(vector)

        if (
          category !==
          activeCategory
        ) {
          return false
        }

        if (!normalizedSearch) {
          return true
        }

        const text =
          `${vector.name} ${
            vector.description ?? ''
          } ${vector.values.join(' ')}`.toLowerCase()

        return text.includes(
          normalizedSearch
        )
      }
    )
  }, [
    vectorList,
    activeCategory,
    search,
  ])

  // ==========================================================
  // FUENTE SELECCIONADA PARA EL MODAL
  // ==========================================================

  const sourceRecords =
    useMemo<SourceRecord[]>(() => {

      // ------------------------------------------------------
      // VENTAS
      // ------------------------------------------------------

      if (
        dataSource === 'Ventas'
      ) {
        return sales.map(
          (sale) => {
            const details =
              sale.details
                ?.map(
                  (detail) =>
                    `${detail.product_name ?? `Producto #${detail.product_id}`} × ${detail.quantity}`
                )
                .join(', ') ||
              'Detalle registrado'

            return {
              id: sale.id,

              title:
                `VNT-${String(
                  sale.id
                ).padStart(
                  4,
                  '0'
                )}`,

              description:
                `${sale.branch_name ?? `Sucursal #${sale.branch_id}`} · ${details}`,

              value:
                Number(
                  sale.total || 0
                ),
            }
          }
        )
      }

      // ------------------------------------------------------
      // INVENTARIO
      // ------------------------------------------------------

      if (
        dataSource === 'Inventario'
      ) {
        return inventoryList.map(
          (item) => ({
            id: item.id,

            title:
              item.product_name ??
              `Producto #${item.product_id}`,

            description:
              `${item.branch_name ?? `Sucursal #${item.branch_id}`} · Stock disponible`,

            value:
              Number(
                item.quantity || 0
              ),
          })
        )
      }

      // ------------------------------------------------------
      // METAS
      // ------------------------------------------------------

      if (
        dataSource === 'Metas'
      ) {
        return targets.map(
          (target) => ({
            id: target.target_id,

            title:
              target.target,

            description:
              `${target.branch} · Cumplimiento actual: ${Number(
                target.compliance_percentage || 0
              ).toFixed(2)}%`,

            value:
              Number(
                target.target_value || 0
              ),
          })
        )
      }

      // ------------------------------------------------------
      // INDICADORES
      // ------------------------------------------------------

      if (
        dataSource === 'Indicadores' &&
        processing
      ) {
        return [
          {
            id: 1001,
            title:
              'Operaciones totales',
            description:
              'Total de operaciones procesadas',
            value:
              Number(
                processing.total_operations || 0
              ),
          },

          {
            id: 1002,
            title:
              'Operaciones completadas',
            description:
              'Operaciones completadas correctamente',
            value:
              Number(
                processing.completed_operations || 0
              ),
          },

          {
            id: 1003,
            title:
              'Operaciones con error',
            description:
              'Operaciones que presentaron errores',
            value:
              Number(
                processing.error_operations || 0
              ),
          },

          {
            id: 1004,
            title:
              'Tasa de éxito',
            description:
              'Porcentaje de operaciones exitosas',
            value:
              Number(
                processing.success_rate || 0
              ),
          },

          {
            id: 1005,
            title:
              'Tiempo promedio',
            description:
              'Tiempo promedio de ejecución en milisegundos',
            value:
              Number(
                processing.avg_execution_time_ms || 0
              ),
          },

          {
            id: 1006,
            title:
              'Operaciones matriciales',
            description:
              'Operaciones realizadas con matrices',
            value:
              Number(
                processing.matrix_operations || 0
              ),
          },

          {
            id: 1007,
            title:
              'Operaciones vectoriales',
            description:
              'Operaciones realizadas con vectores',
            value:
              Number(
                processing.vector_operations || 0
              ),
          },

          {
            id: 1008,
            title:
              'Combinaciones lineales',
            description:
              'Combinaciones lineales procesadas',
            value:
              Number(
                processing.linear_combinations || 0
              ),
          },

          {
            id: 1009,
            title:
              'Módulos activos',
            description:
              'Módulos empresariales actualmente activos',
            value:
              Number(
                processing.active_modules || 0
              ),
          },
        ]
      }

      return []
    }, [
      dataSource,
      sales,
      inventoryList,
      targets,
      processing,
    ])

  // ==========================================================
  // REGISTROS FILTRADOS DEL MODAL
  // ==========================================================

  const filteredSourceRecords =
    useMemo(() => {
      const term =
        sourceSearch
          .trim()
          .toLowerCase()

      if (!term) {
        return sourceRecords
      }

      return sourceRecords.filter(
        (record) =>
          record.title
            .toLowerCase()
            .includes(term) ||
          record.description
            .toLowerCase()
            .includes(term)
      )
    }, [
      sourceRecords,
      sourceSearch,
    ])

  // ==========================================================
  // REGISTROS SELECCIONADOS
  // ==========================================================

  const selectedSourceRecords =
    useMemo(() => {
      return sourceRecords.filter(
        (record) =>
          selectedSourceIds.includes(
            record.id
          )
      )
    }, [
      sourceRecords,
      selectedSourceIds,
    ])

  // ==========================================================
  // VALORES DEL VECTOR
  // ==========================================================

  const generatedValues =
    useMemo(() => {
      return selectedSourceRecords.map(
        (record) =>
          Number(record.value)
      )
    }, [
      selectedSourceRecords,
    ])

  // ==========================================================
  // NOMBRE DEL VECTOR
  // ==========================================================

  const generatedVectorName =
    useMemo(() => {
      if (
        selectedSourceRecords.length ===
        0
      ) {
        return `Vector de ${dataSource.toLowerCase()}`
      }

      if (
        selectedSourceRecords.length ===
        1
      ) {
        const record =
          selectedSourceRecords[0]

        if (
          dataSource ===
          'Ventas'
        ) {
          return `Ventas ${record.title}`
        }

        if (
          dataSource ===
          'Inventario'
        ) {
          return `Inventario - ${record.title}`
        }

        if (
          dataSource ===
          'Metas'
        ) {
          return `Meta - ${record.title}`
        }

        return `Indicador - ${record.title}`
      }

      return `Vector de ${dataSource.toLowerCase()} (${selectedSourceRecords.length} registros)`
    }, [
      dataSource,
      selectedSourceRecords,
    ])

  // ==========================================================
  // DESCRIPCIÓN DEL VECTOR
  // ==========================================================

  const generatedDescription =
    useMemo(() => {
      if (
        selectedSourceRecords.length ===
        0
      ) {
        if (
          dataSource ===
          'Ventas'
        ) {
          return 'Vector generado automáticamente desde las ventas registradas.'
        }

        if (
          dataSource ===
          'Inventario'
        ) {
          return 'Vector generado automáticamente desde los registros de inventario.'
        }

        if (
          dataSource ===
          'Metas'
        ) {
          return 'Vector generado automáticamente desde las metas empresariales registradas.'
        }

        return 'Vector generado automáticamente desde los indicadores de procesamiento del sistema.'
      }

      const quantity =
        selectedSourceRecords.length

      if (
        dataSource ===
        'Ventas'
      ) {
        return `Vector generado automáticamente desde ${quantity} ${
          quantity === 1
            ? 'operación comercial'
            : 'operaciones comerciales'
        } registradas en la base de datos.`
      }

      if (
        dataSource ===
        'Inventario'
      ) {
        return `Vector generado automáticamente desde ${quantity} ${
          quantity === 1
            ? 'registro de inventario'
            : 'registros de inventario'
        } registrados en la base de datos.`
      }

      if (
        dataSource ===
        'Metas'
      ) {
        return `Vector generado automáticamente desde ${quantity} ${
          quantity === 1
            ? 'meta empresarial'
            : 'metas empresariales'
        } registradas en la base de datos.`
      }

      return `Vector generado automáticamente desde ${quantity} ${
        quantity === 1
          ? 'indicador empresarial'
          : 'indicadores empresariales'
      } del sistema.`
    }, [
      dataSource,
      selectedSourceRecords,
    ])

  // ==========================================================
  // ESTADÍSTICAS DEL VECTOR GENERADO
  // ==========================================================

  const vectorSum =
    useMemo(() => {
      return generatedValues.reduce(
        (sum, value) =>
          sum + value,
        0
      )
    }, [
      generatedValues,
    ])

  const vectorAverage =
    useMemo(() => {
      if (
        generatedValues.length ===
        0
      ) {
        return 0
      }

      return (
        vectorSum /
        generatedValues.length
      )
    }, [
      generatedValues,
      vectorSum,
    ])

  // ==========================================================
  // SELECCIONAR REGISTRO
  // ==========================================================

  const toggleSourceSelection = (
    id: number
  ) => {
    setSelectedSourceIds(
      (current) => {
        if (
          current.includes(id)
        ) {
          return current.filter(
            (item) =>
              item !== id
          )
        }

        return [
          ...current,
          id,
        ]
      }
    )
  }

  // ==========================================================
  // SELECCIONAR TODOS
  // ==========================================================

  const selectAllSources = () => {
    if (
      filteredSourceRecords.length ===
      0
    ) {
      return
    }

    setSelectedSourceIds(
      filteredSourceRecords.map(
        (record) =>
          record.id
      )
    )
  }

  // ==========================================================
  // LIMPIAR
  // ==========================================================

  const clearSourceSelection =
    () => {
      setSelectedSourceIds([])
    }

  // ==========================================================
  // CAMBIAR FUENTE
  // ==========================================================

  const changeDataSource = (
    source: DataSource
  ) => {
    setDataSource(source)
    setSelectedSourceIds([])
    setSourceSearch('')
    setError(null)
  }

  // ==========================================================
  // ABRIR MODAL
  // ==========================================================

  const openCreateModal = () => {
    setDataSource('Ventas')
    setSelectedSourceIds([])
    setSourceSearch('')
    setError(null)
    setIsModalOpen(true)
  }

  // ==========================================================
  // CERRAR MODAL
  // ==========================================================

  const closeCreateModal = () => {
    if (submitting) {
      return
    }

    setIsModalOpen(false)
    setSelectedSourceIds([])
    setSourceSearch('')
  }

  // ==========================================================
  // GUARDAR VECTOR
  // ==========================================================

  const handleSave = async () => {
    if (
      selectedSourceRecords.length ===
      0
    ) {
      setError(
        `Selecciona al menos un registro de ${dataSource.toLowerCase()} para generar el vector.`
      )

      return
    }

    if (
      generatedValues.length ===
      0
    ) {
      setError(
        'Los registros seleccionados no contienen valores válidos.'
      )

      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const response =
        await api.post(
          '/api/v1/vectors/',
          {
            name:
              generatedVectorName,

            description:
              generatedDescription,

            values:
              generatedValues,
          }
        )

      const createdVector =
        response.data as VectorItem

      setVectorList(
        (current) => [
          ...current,
          createdVector,
        ]
      )

      setSelectedVector(
        createdVector
      )

      // Llevar al usuario a la categoría
      // del vector recién creado.
      setActiveCategory(
        dataSource
      )

      setSuccessMessage(
        `Vector de ${dataSource.toLowerCase()} generado correctamente con ${generatedValues.length} dimensión${
          generatedValues.length ===
          1
            ? ''
            : 'es'
        }.`
      )

      closeCreateModal()

      setTimeout(() => {
        setSuccessMessage(
          null
        )
      }, 3500)
    } catch (err: any) {
      console.error(
        'Error generando vector:',
        err
      )

      setError(
        err?.response?.data?.detail ||
          'No se pudo guardar el vector generado.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // ==========================================================
  // ELIMINAR VECTOR
  // ==========================================================

  const handleDelete = async (
    vector: VectorItem
  ) => {
    if (
      !window.confirm(
        `¿Deseas eliminar el vector "${vector.name}"?`
      )
    ) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      await api.delete(
        `/api/v1/vectors/${vector.id}`
      )

      setVectorList(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              vector.id
          )
      )

      if (
        selectedVector?.id ===
        vector.id
      ) {
        setSelectedVector(
          null
        )
      }

      setSuccessMessage(
        'Vector eliminado correctamente.'
      )

      setTimeout(() => {
        setSuccessMessage(
          null
        )
      }, 3500)
    } catch (err: any) {
      console.error(
        'Error eliminando vector:',
        err
      )

      setError(
        err?.response?.data?.detail ||
          'No se pudo eliminar el vector.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================
  // MÉTRICAS DEL VECTOR SELECCIONADO
  // ==========================================================

  const selectedValues =
    selectedVector?.values ??
    []

  const selectedDimension =
    selectedValues.length

  const selectedSum =
    selectedValues.reduce(
      (sum, value) =>
        sum +
        Number(value || 0),
      0
    )

  const selectedAverage =
    selectedDimension > 0
      ? selectedSum /
        selectedDimension
      : 0

  const selectedNorm =
    Math.sqrt(
      selectedValues.reduce(
        (sum, value) =>
          sum +
          Math.pow(
            Number(value || 0),
            2
          ),
        0
      )
    )

  const selectedMin =
    selectedDimension > 0
      ? Math.min(
          ...selectedValues
        )
      : 0

  const selectedMax =
    selectedDimension > 0
      ? Math.max(
          ...selectedValues
        )
      : 0

  // ==========================================================
  // RENDER
  // ==========================================================

  if (
    loading &&
    vectorList.length === 0
  ) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={36}
            className="mx-auto mb-3 animate-spin text-[#2563EB]"
          />

          <p className="text-sm font-medium text-[#64748B]">
            Cargando análisis vectorial...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <PageHeader
        title="Análisis Vectorial Empresarial"
        description="Transformación automática de datos empresariales en vectores matemáticos."
        action={
          <div className="flex gap-2">

            <button
              onClick={loadData}
              disabled={loading}
              title="Sincronizar datos"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  loading
                    ? 'animate-spin'
                    : ''
                }
              />

              Sincronizar
            </button>

            {canEdit && (
              <button
                onClick={
                  openCreateModal
                }
                className="flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Plus size={18} />

                Generar vector
              </button>
            )}

          </div>
        }
      />

      {/* ======================================================
          MENSAJE ÉXITO
      ====================================================== */}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          <CheckCircle2
            size={18}
            className="text-emerald-600"
          />

          {successMessage}
        </div>
      )}

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

          <div>
            <p className="font-semibold">
              Error de sincronización
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>

          <button
            onClick={() =>
              setError(null)
            }
            className="rounded-lg p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600"
          >
            <X size={17} />
          </button>

        </div>
      )}

      {/* ======================================================
          KPIs
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Vectores registrados
          </p>

          <p className="mt-2 text-2xl font-bold text-[#0F172A]">
            {vectorList.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Registros matemáticos
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Ventas disponibles
          </p>

          <p className="mt-2 text-2xl font-bold text-[#2563EB]">
            {sales.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Fuente de datos
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Inventario disponible
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {inventoryList.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Registros de stock
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Vector seleccionado
          </p>

          <p className="mt-2 text-2xl font-bold text-[#0F172A]">
            {selectedDimension}D
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Dimensión matemática
          </p>

        </div>

      </div>

      {/* ======================================================
          CATEGORÍAS
      ====================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">

          {categories.map(
            (category) => {
              const config =
                categoryConfig[
                  category
                ]

              const Icon =
                config.icon

              const count =
                vectorList.filter(
                  (vector) =>
                    getVectorCategory(
                      vector
                    ) ===
                    category
                ).length

              const active =
                activeCategory ===
                category

              return (
                <button
                  key={category}
                  onClick={() =>
                    setActiveCategory(
                      category
                    )
                  }
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left transition ${
                    active
                      ? `${config.bg} ${config.color}`
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >

                  <div
                    className={`rounded-lg p-2 ${
                      active
                        ? 'bg-white'
                        : 'bg-slate-100'
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0">

                    <p
                      className={`text-sm font-bold ${
                        active
                          ? config.color
                          : 'text-slate-700'
                      }`}
                    >
                      {category}
                    </p>

                    <p className="text-xs text-slate-400">
                      {count} vectores
                    </p>

                  </div>

                </button>
              )
            }
          )}

        </div>
      </div>

      {/* ======================================================
          CONTENIDO
      ====================================================== */}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">

        {/* ====================================================
            LISTA DE VECTORES
        ==================================================== */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <Layers
                  size={18}
                  className="text-[#2563EB]"
                />

                <h3 className="font-bold text-[#0F172A]">
                  Vectores de{' '}
                  {activeCategory}
                </h3>

              </div>

              <p className="mt-1 text-xs text-[#64748B]">
                {
                  categoryConfig[
                    activeCategory
                  ].description
                }
              </p>

            </div>

            <div className="relative w-full sm:w-64">

              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Buscar vector..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-[#0F172A] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>

          <div className="divide-y divide-slate-100">

            {filteredVectors.map(
              (vector) => {
                const active =
                  selectedVector?.id ===
                  vector.id

                const config =
                  categoryConfig[
                    getVectorCategory(
                      vector
                    )
                  ]

                const Icon =
                  config.icon

                return (
                  <button
                    key={vector.id}
                    onClick={() =>
                      setSelectedVector(
                        vector
                      )
                    }
                    className={`flex w-full items-center gap-4 p-5 text-left transition ${
                      active
                        ? 'bg-blue-50/60'
                        : 'hover:bg-slate-50'
                    }`}
                  >

                    <div
                      className={`shrink-0 rounded-xl p-3 ${config.bg} ${config.color}`}
                    >
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <p className="truncate font-bold text-[#0F172A]">
                          {vector.name}
                        </p>

                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          {
                            vector.values
                              .length
                          }D
                        </span>

                      </div>

                      <p className="mt-1 truncate text-xs text-[#64748B]">
                        {vector.description ||
                          'Vector empresarial'}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1.5">

                        {vector.values
                          .slice(
                            0,
                            6
                          )
                          .map(
                            (
                              value,
                              index
                            ) => (
                              <span
                                key={
                                  index
                                }
                                className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-600"
                              >
                                {Number(
                                  value
                                ).toFixed(
                                  2
                                )}
                              </span>
                            )
                          )}

                        {vector.values
                          .length >
                          6 && (
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-500">
                            +
                            {vector
                              .values
                              .length -
                              6}{' '}
                            más
                          </span>
                        )}

                      </div>

                    </div>

                    <Eye
                      size={17}
                      className={
                        active
                          ? 'text-[#2563EB]'
                          : 'text-slate-300'
                      }
                    />

                  </button>
                )
              }
            )}

            {filteredVectors.length ===
              0 && (
              <div className="px-5 py-12 text-center">

                <div className="mx-auto mb-3 w-fit rounded-full bg-slate-100 p-4">
                  <Layers
                    size={24}
                    className="text-slate-400"
                  />
                </div>

                <p className="font-semibold text-slate-700">
                  No hay vectores registrados
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Genera un vector desde
                  los datos empresariales.
                </p>

              </div>
            )}

          </div>
        </div>

        {/* ====================================================
            INSPECTOR
        ==================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

          {selectedVector ? (
            <>

              <div className="border-b border-slate-100 p-5">

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                      Inspector vectorial
                    </p>

                    <h3 className="mt-1 font-bold text-[#0F172A]">
                      {selectedVector.name}
                    </h3>

                  </div>

                  <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                    {selectedDimension}D
                  </span>

                </div>

                <p className="mt-2 text-xs leading-5 text-[#64748B]">
                  {selectedVector.description ||
                    'Sin descripción.'}
                </p>

              </div>

              <div className="space-y-4 p-5">

                <div>

                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Representación
                  </p>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <p className="mb-2 font-mono text-xs font-bold text-slate-500">
                      v =
                    </p>

                    <div className="flex min-w-max items-center gap-1 font-mono text-sm text-[#0F172A]">

                      <span>[</span>

                      {selectedValues.map(
                        (
                          value,
                          index
                        ) => (
                          <span
                            key={
                              index
                            }
                          >
                            {Number(
                              value
                            ).toFixed(
                              2
                            )}

                            {index <
                            selectedValues.length -
                              1
                              ? ','
                              : ''}
                          </span>
                        )
                      )}

                      <span>]</span>

                    </div>

                  </div>

                </div>

                <div className="grid grid-cols-2 gap-3">

                  <MetricCard
                    label="Dimensión"
                    value={`${selectedDimension}D`}
                  />

                  <MetricCard
                    label="Suma"
                    value={selectedSum.toFixed(
                      2
                    )}
                  />

                  <MetricCard
                    label="Promedio"
                    value={selectedAverage.toFixed(
                      2
                    )}
                  />

                  <MetricCard
                    label="Norma"
                    value={selectedNorm.toFixed(
                      2
                    )}
                  />

                  <MetricCard
                    label="Mínimo"
                    value={selectedMin.toFixed(
                      2
                    )}
                  />

                  <MetricCard
                    label="Máximo"
                    value={selectedMax.toFixed(
                      2
                    )}
                  />

                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

                  <div className="flex items-start gap-3">

                    <Calculator
                      size={18}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <div>

                      <p className="text-sm font-bold text-blue-900">
                        Interpretación matemática
                      </p>

                      <p className="mt-1 text-xs leading-5 text-blue-700">
                        Este vector contiene{' '}
                        {
                          selectedDimension
                        }{' '}
                        valores empresariales.
                        La suma de sus
                        componentes es{' '}
                        {selectedSum.toFixed(
                          2
                        )}
                        .
                      </p>

                    </div>

                  </div>

                </div>

                {canEdit && (
                  <button
                    onClick={() =>
                      handleDelete(
                        selectedVector
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={16} />

                    Eliminar vector
                  </button>
                )}

              </div>

            </>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center p-8 text-center">

              <div>

                <div className="mx-auto mb-4 w-fit rounded-full bg-slate-100 p-5">

                  <BarChart3
                    size={30}
                    className="text-slate-400"
                  />

                </div>

                <p className="font-bold text-slate-700">
                  Selecciona un vector
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Aquí podrás consultar sus
                  propiedades matemáticas.
                </p>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* ======================================================
          MODAL
      ====================================================== */}

      <Modal
        isOpen={isModalOpen}
        onClose={closeCreateModal}
        title="Generar vector empresarial"
        description="Los valores se obtienen automáticamente desde los módulos empresariales registrados."
      >

        <div className="space-y-5">

          {/* ==================================================
              FUENTES
          ================================================== */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
              Fuente de datos
            </label>

            <div className="grid grid-cols-2 gap-3">

              {/* VENTAS */}

              <button
                type="button"
                onClick={() =>
                  changeDataSource(
                    'Ventas'
                  )
                }
                className={`rounded-xl border p-4 text-left transition ${
                  dataSource ===
                  'Ventas'
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >

                <div className="mb-3 flex items-center justify-between">

                  <div
                    className={`rounded-lg p-2 ${
                      dataSource ===
                      'Ventas'
                        ? 'bg-white text-blue-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <ShoppingCart
                      size={19}
                    />
                  </div>

                  {dataSource ===
                    'Ventas' && (
                    <div className="rounded-full bg-blue-600 p-1 text-white">
                      <Check size={12} />
                    </div>
                  )}

                </div>

                <p className="text-sm font-bold text-[#0F172A]">
                  Ventas
                </p>

                <p className="mt-1 text-xs leading-5 text-[#64748B]">
                  {sales.length}{' '}
                  registros disponibles
                </p>

              </button>

              {/* INVENTARIO */}

              <button
                type="button"
                onClick={() =>
                  changeDataSource(
                    'Inventario'
                  )
                }
                className={`rounded-xl border p-4 text-left transition ${
                  dataSource ===
                  'Inventario'
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >

                <div className="mb-3 flex items-center justify-between">

                  <div
                    className={`rounded-lg p-2 ${
                      dataSource ===
                      'Inventario'
                        ? 'bg-white text-emerald-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Package
                      size={19}
                    />
                  </div>

                  {dataSource ===
                    'Inventario' && (
                    <div className="rounded-full bg-emerald-600 p-1 text-white">
                      <Check size={12} />
                    </div>
                  )}

                </div>

                <p className="text-sm font-bold text-[#0F172A]">
                  Inventario
                </p>

                <p className="mt-1 text-xs leading-5 text-[#64748B]">
                  {inventoryList.length}{' '}
                  registros disponibles
                </p>

              </button>

              {/* METAS */}

              <button
                type="button"
                onClick={() =>
                  changeDataSource(
                    'Metas'
                  )
                }
                className={`rounded-xl border p-4 text-left transition ${
                  dataSource ===
                  'Metas'
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >

                <div className="mb-3 flex items-center justify-between">

                  <div
                    className={`rounded-lg p-2 ${
                      dataSource ===
                      'Metas'
                        ? 'bg-white text-amber-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <BarChart3
                      size={19}
                    />
                  </div>

                  {dataSource ===
                    'Metas' && (
                    <div className="rounded-full bg-amber-600 p-1 text-white">
                      <Check size={12} />
                    </div>
                  )}

                </div>

                <p className="text-sm font-bold text-[#0F172A]">
                  Metas
                </p>

                <p className="mt-1 text-xs leading-5 text-[#64748B]">
                  {targets.length}{' '}
                  registros disponibles
                </p>

              </button>

              {/* INDICADORES */}

              <button
                type="button"
                onClick={() =>
                  changeDataSource(
                    'Indicadores'
                  )
                }
                className={`rounded-xl border p-4 text-left transition ${
                  dataSource ===
                  'Indicadores'
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >

                <div className="mb-3 flex items-center justify-between">

                  <div
                    className={`rounded-lg p-2 ${
                      dataSource ===
                      'Indicadores'
                        ? 'bg-white text-purple-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Calculator
                      size={19}
                    />
                  </div>

                  {dataSource ===
                    'Indicadores' && (
                    <div className="rounded-full bg-purple-600 p-1 text-white">
                      <Check size={12} />
                    </div>
                  )}

                </div>

                <p className="text-sm font-bold text-[#0F172A]">
                  Indicadores
                </p>

                <p className="mt-1 text-xs leading-5 text-[#64748B]">
                  {processing
                    ? '9'
                    : '0'}{' '}
                  registros disponibles
                </p>

              </button>

            </div>

          </div>

          {/* ==================================================
              BUSCADOR
          ================================================== */}

          <div>

            <div className="mb-2 flex items-center justify-between">

              <div>

                <label className="block text-sm font-semibold text-[#0F172A]">
                  {dataSource ===
                  'Ventas'
                    ? 'Registros de ventas'
                    : dataSource ===
                      'Inventario'
                      ? 'Registros de inventario'
                      : dataSource ===
                        'Metas'
                        ? 'Metas empresariales'
                        : 'Indicadores de procesamiento'}
                </label>

                <p className="text-xs text-[#64748B]">
                  Selecciona los registros que
                  formarán las dimensiones del
                  vector.
                </p>

              </div>

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={
                    selectAllSources
                  }
                  disabled={
                    filteredSourceRecords.length ===
                    0
                  }
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-40"
                >
                  Seleccionar todos
                </button>

                <button
                  type="button"
                  onClick={
                    clearSourceSelection
                  }
                  disabled={
                    selectedSourceIds.length ===
                    0
                  }
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-40"
                >
                  Limpiar
                </button>

              </div>

            </div>

            <div className="relative">

              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={sourceSearch}
                onChange={(
                  event
                ) =>
                  setSourceSearch(
                    event.target.value
                  )
                }
                placeholder={
                  dataSource ===
                  'Ventas'
                    ? 'Buscar venta o sucursal...'
                    : dataSource ===
                      'Inventario'
                      ? 'Buscar producto o sucursal...'
                      : dataSource ===
                        'Metas'
                        ? 'Buscar meta o sucursal...'
                        : 'Buscar indicador...'
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>

          {/* ==================================================
              LISTA DE REGISTROS
          ================================================== */}

          <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">

            {(dataSource ===
              'Ventas'
              ? loadingSales
              : dataSource ===
                'Inventario'
                ? loadingInventory
                : dataSource ===
                  'Metas'
                  ? loadingTargets
                  : loadingIndicators) ? (
              <div className="flex items-center justify-center rounded-xl border border-slate-200 p-10">

                <Loader2
                  size={26}
                  className="animate-spin text-blue-600"
                />

              </div>
            ) : filteredSourceRecords.length ===
              0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">

                {dataSource ===
                'Ventas' ? (
                  <ShoppingCart
                    size={28}
                    className="mx-auto mb-2 text-slate-400"
                  />
                ) : dataSource ===
                  'Inventario' ? (
                  <Package
                    size={28}
                    className="mx-auto mb-2 text-slate-400"
                  />
                ) : dataSource ===
                  'Metas' ? (
                  <BarChart3
                    size={28}
                    className="mx-auto mb-2 text-slate-400"
                  />
                ) : (
                  <Calculator
                    size={28}
                    className="mx-auto mb-2 text-slate-400"
                  />
                )}

                <p className="text-sm font-semibold text-slate-700">
                  No hay registros de{' '}
                  {dataSource.toLowerCase()}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {dataSource ===
                  'Ventas'
                    ? 'Registra una venta primero en el módulo Ventas.'
                    : dataSource ===
                      'Inventario'
                      ? 'Registra inventario primero en el módulo Inventario.'
                      : dataSource ===
                        'Metas'
                        ? 'Registra una meta primero en el módulo correspondiente.'
                        : 'No hay indicadores de procesamiento disponibles.'}
                </p>

              </div>
            ) : (
              filteredSourceRecords.map(
                (record) => {
                  const selected =
                    selectedSourceIds.includes(
                      record.id
                    )

                  return (
                    <button
                      key={
                        record.id
                      }
                      type="button"
                      onClick={() =>
                        toggleSourceSelection(
                          record.id
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                        selected
                          ? dataSource ===
                            'Ventas'
                            ? 'border-blue-300 bg-blue-50'
                            : dataSource ===
                              'Inventario'
                              ? 'border-emerald-300 bg-emerald-50'
                              : dataSource ===
                                'Metas'
                                ? 'border-amber-300 bg-amber-50'
                                : 'border-purple-300 bg-purple-50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >

                      {/* CHECK */}

                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          selected
                            ? dataSource ===
                              'Ventas'
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : dataSource ===
                                'Inventario'
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : dataSource ===
                                  'Metas'
                                  ? 'border-amber-600 bg-amber-600 text-white'
                                  : 'border-purple-600 bg-purple-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >

                        {selected && (
                          <Check
                            size={13}
                          />
                        )}

                      </div>

                      {/* INFO */}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="truncate font-mono text-xs font-bold text-[#0F172A]">
                            {
                              record.title
                            }
                          </span>

                          <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                            {dataSource ===
                            'Ventas'
                              ? 'VENTA'
                              : dataSource ===
                                'Inventario'
                                ? 'STOCK'
                                : dataSource ===
                                  'Metas'
                                  ? 'META'
                                  : 'KPI'}
                          </span>

                        </div>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {
                            record.description
                          }
                        </p>

                      </div>

                      {/* VALOR */}

                      <div className="shrink-0 text-right">

                        <p
                          className={`font-mono text-sm font-bold ${
                            dataSource ===
                            'Ventas'
                              ? 'text-blue-600'
                              : dataSource ===
                                'Inventario'
                                ? 'text-emerald-600'
                                : dataSource ===
                                  'Metas'
                                  ? 'text-amber-600'
                                  : 'text-purple-600'
                          }`}
                        >
                          {dataSource ===
                          'Ventas'
                            ? `S/ ${Number(record.value).toFixed(2)}`
                            : dataSource ===
                              'Inventario'
                              ? `${Number(record.value).toFixed(2)} uds.`
                              : dataSource ===
                                'Metas'
                                ? `${Number(record.value).toFixed(2)}`
                                : `${Number(record.value).toFixed(2)}`}
                        </p>

                        <p className="text-[10px] text-slate-400">
                          componente
                        </p>

                      </div>

                    </button>
                  )
                }
              )
            )}

          </div>

          {/* ==================================================
              VECTOR PREVISUALIZADO
          ================================================== */}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

            <div className="mb-3 flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Vector generado automáticamente
                </p>

                <p className="mt-1 text-sm font-bold text-[#0F172A]">
                  {generatedVectorName}
                </p>

              </div>

              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                  dataSource ===
                  'Ventas'
                    ? 'bg-blue-100 text-blue-600'
                    : dataSource ===
                      'Inventario'
                      ? 'bg-emerald-100 text-emerald-600'
                      : dataSource ===
                        'Metas'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-purple-100 text-purple-600'
                }`}
              >
                {
                  generatedValues.length
                }
                D
              </span>

            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-3">

              <p className="font-mono text-xs text-slate-400">
                v =
              </p>

              <p className="mt-1 min-w-max font-mono text-sm font-semibold text-[#0F172A]">

                [
                {generatedValues.length >
                0
                  ? generatedValues
                      .map(
                        (
                          value
                        ) =>
                          ` ${Number(value).toFixed(2)}`
                      )
                      .join(',')
                  : ' Selecciona registros'}
                ]

              </p>

            </div>

            {generatedValues.length >
              0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">

                <div className="rounded-lg bg-white p-3">

                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Suma
                  </p>

                  <p className="mt-1 font-mono text-sm font-bold text-[#0F172A]">
                    {dataSource ===
                    'Ventas'
                      ? `S/ ${vectorSum.toFixed(2)}`
                      : dataSource ===
                        'Inventario'
                        ? `${vectorSum.toFixed(2)} uds.`
                        : vectorSum.toFixed(
                            2
                          )}
                  </p>

                </div>

                <div className="rounded-lg bg-white p-3">

                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Promedio
                  </p>

                  <p className="mt-1 font-mono text-sm font-bold text-[#0F172A]">
                    {dataSource ===
                    'Ventas'
                      ? `S/ ${vectorAverage.toFixed(2)}`
                      : dataSource ===
                        'Inventario'
                        ? `${vectorAverage.toFixed(2)} uds.`
                        : vectorAverage.toFixed(
                            2
                          )}
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* ==================================================
              INFORMACIÓN
          ================================================== */}

          <div
            className={`rounded-xl border p-4 ${
              dataSource ===
              'Ventas'
                ? 'border-blue-100 bg-blue-50'
                : dataSource ===
                  'Inventario'
                  ? 'border-emerald-100 bg-emerald-50'
                  : dataSource ===
                    'Metas'
                    ? 'border-amber-100 bg-amber-50'
                    : 'border-purple-100 bg-purple-50'
            }`}
          >

            <div className="flex gap-3">

              <Database
                size={18}
                className={`mt-0.5 shrink-0 ${
                  dataSource ===
                  'Ventas'
                    ? 'text-blue-600'
                    : dataSource ===
                      'Inventario'
                      ? 'text-emerald-600'
                      : dataSource ===
                        'Metas'
                        ? 'text-amber-600'
                        : 'text-purple-600'
                }`}
              />

              <div>

                <p
                  className={`text-sm font-bold ${
                    dataSource ===
                    'Ventas'
                      ? 'text-blue-900'
                      : dataSource ===
                        'Inventario'
                        ? 'text-emerald-900'
                        : dataSource ===
                          'Metas'
                          ? 'text-amber-900'
                          : 'text-purple-900'
                  }`}
                >
                  Datos sincronizados
                </p>

                <p
                  className={`mt-1 text-xs leading-5 ${
                    dataSource ===
                    'Ventas'
                      ? 'text-blue-700'
                      : dataSource ===
                        'Inventario'
                        ? 'text-emerald-700'
                        : dataSource ===
                          'Metas'
                          ? 'text-amber-700'
                          : 'text-purple-700'
                  }`}
                >

                  {dataSource ===
                  'Ventas' ? (
                    <>
                      Los valores del vector
                      provienen directamente del
                      campo{' '}
                      <strong>
                        total
                      </strong>{' '}
                      de cada venta seleccionada.
                      No es necesario introducir
                      valores manualmente.
                    </>
                  ) : dataSource ===
                    'Inventario' ? (
                    <>
                      Los valores del vector
                      provienen directamente del
                      campo{' '}
                      <strong>
                        quantity
                      </strong>{' '}
                      de cada registro de
                      inventario seleccionado.
                      No es necesario introducir
                      valores manualmente.
                    </>
                  ) : dataSource ===
                    'Metas' ? (
                    <>
                      Los valores del vector
                      provienen directamente del
                      campo{' '}
                      <strong>
                        target_value
                      </strong>{' '}
                      de cada meta empresarial.
                      No es necesario introducir
                      valores manualmente.
                    </>
                  ) : (
                    <>
                      Los valores del vector
                      provienen directamente de
                      los indicadores numéricos
                      generados por el sistema.
                      No es necesario introducir
                      valores manualmente.
                    </>
                  )}

                </p>

              </div>

            </div>

          </div>

          {/* ==================================================
              ACCIONES
          ================================================== */}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

            <button
              type="button"
              onClick={
                closeCreateModal
              }
              disabled={submitting}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#64748B] transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={
                submitting ||
                selectedSourceRecords.length ===
                  0
              }
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                dataSource ===
                'Ventas'
                  ? 'bg-[#2563EB] hover:bg-blue-700'
                  : dataSource ===
                    'Inventario'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : dataSource ===
                      'Metas'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >

              {submitting ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Plus size={16} />
              )}

              Generar vector

            </button>

          </div>

        </div>
      </Modal>
    </div>
  )
}

// ============================================================
// TARJETA DE MÉTRICA
// ============================================================

function MetricCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">

      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-mono text-sm font-bold text-[#0F172A]">
        {value}
      </p>

    </div>
  )
}