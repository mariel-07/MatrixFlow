import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  Boxes,
  Calculator,
  CheckCircle2,
  Cpu,
  Download,
  FileSpreadsheet,
  FileText,
  Globe,
  Printer,
  RefreshCw,
  Shield,
  ShoppingCart,
  Sparkles,
  Target as TargetIcon,
  TrendingUp,
  Warehouse,
  X,
} from 'lucide-react'

import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  downloadCSV,
  downloadJSON,
  generateFullReportCSV,
  printExecutiveReport,
  type ExportDataPayload,
} from '../utils/exportUtils'

interface GeneralItem {
  module: string
  total: number
}

interface BranchSale {
  branch_id: number
  branch: string
  total_sales: number
  sales_count?: number
  percentage?: number
}

interface ProductSale {
  product_id: number
  product: string
  total_sales: number
  quantity_sold: number
  percentage?: number
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

interface InventoryItem {
  inventory_id: number
  product_id: number
  product: string
  branch_id: number
  branch: string
  quantity: number
  quantity_sold: number
  rotation: number
  status?: string
  rotation_speed?: string
}

interface MathOperation {
  id: number
  operation_type: string
  inputs?: any[]
  result?: any
  result_type?: string
  status: string
  created_at: string
}

interface Activity {
  id: number
  user_id: number | null
  username?: string
  action: string
  module: string
  ip_address?: string
  status: string
  result: string
  created_at: string
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

interface ReportSection {
  module: string
  total?: number
  data?: any
}

interface ReportResponse {
  report_type: string
  data: ReportSection[]
}

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [general, setGeneral] = useState<GeneralItem[]>([])
  const [salesByBranch, setSalesByBranch] = useState<BranchSale[]>([])
  const [salesByProduct, setSalesByProduct] = useState<ProductSale[]>([])
  const [targets, setTargets] = useState<TargetItem[]>([])
  const [inventoryRotation, setInventoryRotation] = useState<InventoryItem[]>([])
  const [operations, setOperations] = useState<MathOperation[]>([])
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [processing, setProcessing] = useState<ProcessingIndicators | null>(null)

  // Export & modal state
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false)
  const [selectedOperation, setSelectedOperation] = useState<MathOperation | null>(null)
  const [exportNotice, setExportNotice] = useState('')

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get<ReportResponse>('/api/v1/reports/')
      const sections = response.data.data || []

      // Datos Generales
      const generalData = sections.filter(
        (item): item is GeneralItem =>
          ['companies', 'branches', 'products', 'sales', 'inventory'].includes(item.module) &&
          typeof item.total === 'number'
      )
      setGeneral(generalData)

      // 1. Ventas por Sucursal
      const branchSec = sections.find((s) => s.module === 'sales_by_branch')
      if (branchSec?.data) setSalesByBranch(branchSec.data)

      // 2. Ventas por Producto
      const prodSec = sections.find((s) => s.module === 'sales_by_product')
      if (prodSec?.data) setSalesByProduct(prodSec.data)

      // 3. Cumplimiento de Metas
      const targetSec = sections.find((s) => s.module === 'target_compliance')
      if (targetSec?.data) setTargets(targetSec.data)

      // 4. Inventario y Rotación
      const invSec = sections.find((s) => s.module === 'inventory_rotation')
      if (invSec?.data) setInventoryRotation(invSec.data)

      // 5. Resultados de Operaciones Matemáticas
      const opSec = sections.find((s) => s.module === 'operations')
      if (opSec?.data) setOperations(opSec.data)

      // 6. Actividad Reciente
      const actSec = sections.find((s) => s.module === 'recent_activity')
      if (actSec?.data) setRecentActivity(actSec.data)

      // 7. Indicadores de Procesamiento
      const procSec = sections.find((s) => s.module === 'processing_indicators')
      if (procSec?.data) setProcessing(procSec.data)
    } catch (err: any) {
      console.error('Error cargando Dashboard:', err)
      setError('No se pudieron obtener los datos consolidados del sistema.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  // Helpers de Formato
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleString('es-PE', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    } catch {
      return date
    }
  }

  const totalSalesRevenue = salesByBranch.reduce(
    (sum, item) => sum + Number(item.total_sales || 0),
    0
  )

  const totalProductsSold = salesByProduct.reduce(
    (sum, item) => sum + Number(item.quantity_sold || 0),
    0
  )

  const totalStockCount = inventoryRotation.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  )

  const maxBranchSales = Math.max(
    ...salesByBranch.map((item) => Number(item.total_sales || 0)),
    1
  )

  // Export handlers
  const getPayload = (): ExportDataPayload => ({
    general,
    salesByBranch,
    salesByProduct,
    targetCompliance: targets,
    inventoryRotation,
    operations,
    recentActivity,
    processingIndicators: processing,
    generatedBy: user?.username || 'Usuario Actual',
  })

  const triggerCSVExport = () => {
    const csv = generateFullReportCSV(getPayload())
    downloadCSV(`MatrixFlow_Dashboard_${new Date().toISOString().slice(0, 10)}.csv`, csv)
    showExportToast('Reporte CSV descargado con éxito.')
  }

  const triggerJSONExport = () => {
    downloadJSON(`MatrixFlow_Dashboard_${new Date().toISOString().slice(0, 10)}.json`, getPayload())
    showExportToast('Dataset JSON descargado con éxito.')
  }

  const triggerPrintExport = () => {
    printExecutiveReport(getPayload())
    showExportToast('Generando vista de impresión / PDF...')
  }

  const showExportToast = (msg: string) => {
    setIsExportMenuOpen(false)
    setExportNotice(msg)
    setTimeout(() => setExportNotice(''), 3500)
  }

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-6">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-600">Cargando datos del sistema MatrixFlow Enterprise...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h2 className="text-lg font-bold">Error de Conexión</h2>
          <p className="mt-1 text-sm">{error}</p>
          <button
            onClick={loadDashboard}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast Notificación Exportación */}
      {exportNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-400" />
          {exportNotice}
        </div>
      )}

      {/* ========================================================
          1. ENCABEZADO Y SUITE DE EXPORTACIONES (FASE 7)
      ======================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Dashboard MatrixFlow
            </h1>
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
               Oficial
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Monitor integral de ventas, inventario, motor matemático y auditoría en tiempo real.
          </p>
        </div>

        {/* Acciones y Exportaciones Futuras */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={loadDashboard}
            title="Refrescar datos"
            className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-50 transition"
          >
            <RefreshCw size={17} />
          </button>

          {/* Menú de Exportación */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <Download size={17} />
              <span>Exportar Reporte</span>
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-30">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Formatos Disponibles
                </div>
                <button
                  onClick={triggerPrintExport}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 transition"
                >
                  <Printer size={16} className="text-blue-600" />
                  <span>Imprimir / PDF Ejecutivo</span>
                </button>
                <button
                  onClick={triggerCSVExport}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 transition"
                >
                  <FileSpreadsheet size={16} className="text-emerald-600" />
                  <span>Descargar Excel / CSV</span>
                </button>
                <button
                  onClick={triggerJSONExport}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 transition"
                >
                  <FileText size={16} className="text-purple-600" />
                  <span>Exportar Estructura JSON</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          2. INDICADORES DE PROCESAMIENTO Y KPIS PRINCIPALES
      ======================================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* TOTAL VENTAS */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Ventas Totales
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(totalSalesRevenue)}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {salesByBranch.reduce((sum, b) => sum + (b.sales_count || 1), 0)} transacciones registradas
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <ShoppingCart size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-medium text-blue-600">
            <ArrowUpRight size={14} />
            Ingresos en soles (PEN)
          </div>
        </div>

        {/* PRODUCTOS */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Unidades Vendidas
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {totalProductsSold} uds
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {salesByProduct.length} productos con movimiento
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <Boxes size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <TrendingUp size={14} />
            Rotación de catálogo
          </div>
        </div>

        {/* INVENTARIO */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Stock en Inventario
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {totalStockCount}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {inventoryRotation.length} registros en sucursales
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <Warehouse size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-medium text-amber-600">
            <ArrowUpRight size={14} />
            Disponibilidad física
          </div>
        </div>

        {/* INDICADOR MOTOR MATEMÁTICO */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Motor Matemático
              </p>
              <h2 className="mt-2 text-2xl font-bold text-purple-700">
                {processing?.success_rate ?? 100}% éxito
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {processing?.total_operations ?? operations.length} cálculos ejecutados
              </p>
            </div>
            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
              <Cpu size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-medium text-purple-700">
            <Sparkles size={14} />
            Latencia: {processing?.avg_execution_time_ms ?? 12.8} ms
          </div>
        </div>
      </div>

      {/* ========================================================
          3. INDICADORES DE PROCESAMIENTO (CARD DETALLADA)
      ======================================================== */}
      {processing && (
        <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50/60 via-white to-blue-50/40 p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-purple-100/60 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-purple-600 p-2 text-white">
                <Cpu size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Indicadores de Procesamiento del Motor de Álgebra Lineal
                </h3>
                <p className="text-xs text-slate-500">
                  Rendimiento y distribución de operaciones matriciales y vectoriales
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Motor: {processing.engine_status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6 text-center">
            <div className="rounded-xl bg-white p-3 border border-purple-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Operaciones Totales</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{processing.total_operations}</p>
            </div>
            <div className="rounded-xl bg-white p-3 border border-purple-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Completadas</p>
              <p className="text-lg font-bold text-emerald-600 mt-1">{processing.completed_operations}</p>
            </div>
            <div className="rounded-xl bg-white p-3 border border-purple-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Matrices</p>
              <p className="text-lg font-bold text-blue-600 mt-1">{processing.matrix_operations}</p>
            </div>
            <div className="rounded-xl bg-white p-3 border border-purple-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Vectores</p>
              <p className="text-lg font-bold text-cyan-600 mt-1">{processing.vector_operations}</p>
            </div>
            <div className="rounded-xl bg-white p-3 border border-purple-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Comb. Lineales</p>
              <p className="text-lg font-bold text-violet-600 mt-1">{processing.linear_combinations}</p>
            </div>
            <div className="rounded-xl bg-white p-3 border border-purple-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Tiempo Promedio</p>
              <p className="text-lg font-bold text-slate-800 mt-1">{processing.avg_execution_time_ms} ms</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. VENTAS POR SUCURSAL Y VENTAS POR PRODUCTO
      ======================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* VENTAS POR SUCURSAL */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Ventas por Sucursal</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribución de ingresos y participación sobre el total
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              {salesByBranch.length} Sucursales
            </span>
          </div>

          <div className="space-y-4">
            {salesByBranch.map((branch) => {
              const pct = (Number(branch.total_sales || 0) / maxBranchSales) * 100
              const share = branch.percentage ?? (totalSalesRevenue > 0 ? (Number(branch.total_sales) / totalSalesRevenue) * 100 : 0)

              return (
                <div key={branch.branch_id} className="rounded-xl border border-slate-100 p-3 hover:bg-slate-50/60 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-slate-800">{branch.branch}</span>
                    <span className="font-bold text-sm text-slate-900">
                      {formatCurrency(Number(branch.total_sales || 0))}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-2 text-[11px] text-slate-500">
                    <span>Transacciones: {branch.sales_count ?? 1}</span>
                    <span className="font-semibold text-blue-600">{Number(share).toFixed(1)}% del total</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* VENTAS POR PRODUCTO */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Ventas por Producto</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Volumen vendido e importes generados por artículo
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              {salesByProduct.length} Artículos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase font-semibold text-slate-400">
                <tr>
                  <th className="pb-3">Producto</th>
                  <th className="pb-3 text-right">Unidades</th>
                  <th className="pb-3 text-right">Total Ventas</th>
                  <th className="pb-3 text-right">Aporte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {salesByProduct.map((p) => {
                  const share = p.percentage ?? (totalSalesRevenue > 0 ? (Number(p.total_sales) / totalSalesRevenue) * 100 : 0)

                  return (
                    <tr key={p.product_id} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-medium text-slate-900">{p.product}</td>
                      <td className="py-3 text-right font-mono text-slate-600">{p.quantity_sold} uds</td>
                      <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(p.total_sales)}</td>
                      <td className="py-3 text-right">
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          {Number(share).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================
          5. CUMPLIMIENTO DE METAS (FASE 7)
      ======================================================== */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <TargetIcon size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Cumplimiento de Metas Comerciales</h2>
              <p className="text-xs text-slate-500">
                Avance en ventas por sucursal frente a los objetivos establecidos
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {targets.map((t) => {
            const isCompleted = t.compliance_percentage >= 100
            const inProgress = t.compliance_percentage >= 50

            return (
              <div
                key={t.target_id}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:border-slate-200 transition"
              >
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider">{t.branch}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : inProgress
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                  >
                    {t.status || (isCompleted ? 'Cumplida' : inProgress ? 'En progreso' : 'En riesgo')}
                  </span>
                </div>

                <h3 className="mt-1 font-bold text-slate-900 text-sm truncate">{t.target}</h3>

                <div className="mt-3 flex items-baseline justify-between text-xs">
                  <span className="text-slate-500">Logrado: <strong>{formatCurrency(t.sales)}</strong></span>
                  <span className="text-slate-400">Meta: {formatCurrency(t.target_value)}</span>
                </div>

                <div className="mt-2 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${isCompleted ? 'bg-emerald-500' : inProgress ? 'bg-blue-600' : 'bg-amber-500'
                      }`}
                    style={{ width: `${Math.min(t.compliance_percentage, 100)}%` }}
                  />
                </div>

                <div className="mt-2 text-right">
                  <span className="font-mono text-xs font-bold text-slate-700">
                    {t.compliance_percentage}% completado
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ========================================================
          6. INVENTARIO Y ROTACIÓN (FASE 7)
      ======================================================== */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Warehouse size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Inventario y Rotación</h2>
              <p className="text-xs text-slate-500">
                Índice de rotación por producto y sucursal (Ventas / Stock disponible)
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase font-semibold text-slate-400">
              <tr>
                <th className="pb-3">Producto</th>
                <th className="pb-3">Sucursal</th>
                <th className="pb-3 text-right">Stock Actual</th>
                <th className="pb-3 text-right">Uds Vendidas</th>
                <th className="pb-3 text-right">Índice Rotación</th>
                <th className="pb-3 text-center">Estado Stock</th>
                <th className="pb-3 text-right">Velocidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {inventoryRotation.map((inv) => (
                <tr key={inv.inventory_id} className="hover:bg-slate-50 transition">
                  <td className="py-3 font-semibold text-slate-900">{inv.product}</td>
                  <td className="py-3 text-slate-600">{inv.branch}</td>
                  <td className="py-3 text-right font-mono font-semibold text-slate-800">{inv.quantity}</td>
                  <td className="py-3 text-right font-mono text-slate-600">{inv.quantity_sold}</td>
                  <td className="py-3 text-right font-mono font-bold text-blue-600">
                    {Number(inv.rotation || 0).toFixed(2)}
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${inv.status === 'Normal' || Number(inv.quantity) > 10
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                    >
                      {inv.status || 'Normal'}
                    </span>
                  </td>
                  <td className="py-3 text-right text-xs font-medium text-slate-500">
                    {inv.rotation_speed || (Number(inv.rotation) >= 1 ? 'Alta rotación' : 'Media rotación')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          7. RESULTADOS DE OPERACIONES MATEMÁTICAS (FASE 7)
      ======================================================== */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <Calculator size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Resultados de Operaciones Matemáticas</h2>
              <p className="text-xs text-slate-500">
                Últimos cálculos algebraicos ejecutados por el motor matemático
              </p>
            </div>
          </div>
          <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2.5 py-1 rounded-lg">
            {operations.length} Operaciones
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {operations.slice(0, 6).map((op) => (
            <div
              key={op.id}
              onClick={() => setSelectedOperation(op)}
              className="cursor-pointer rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:border-purple-200 hover:bg-purple-50/20 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-purple-700 uppercase">
                  {op.operation_type.replace(/_/g, ' ')}
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  {op.status}
                </span>
              </div>

              <div className="mt-3 rounded-lg bg-white p-2.5 border border-slate-200/60 font-mono text-xs text-slate-800 truncate">
                <span className="text-slate-400">Resultado: </span>
                {typeof op.result === 'object' ? JSON.stringify(op.result) : String(op.result ?? 'Completado')}
              </div>

              <div className="mt-2.5 flex justify-between items-center text-[11px] text-slate-400">
                <span>ID: #{op.id}</span>
                <span>{formatDate(op.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          8. ACTIVIDAD RECIENTE / AUDITORÍA (FASE 6 & FASE 7)
      ======================================================== */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Actividad Reciente y Bitácora de Auditoría</h2>
              <p className="text-xs text-slate-500">
                Eventos de seguridad y operaciones auditadas 
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-xs shrink-0 mt-0.5">
                  {activity.action.slice(0, 1)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">{activity.result}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{activity.username || 'Sistema'}</span>
                    <span>·</span>
                    <span className="font-mono text-blue-600">{activity.module}</span>
                    <span>·</span>
                    <span className="font-mono text-slate-400 flex items-center gap-1">
                      <Globe size={11} /> {activity.ip_address || '127.0.0.1'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:text-right text-xs">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${activity.status === 'SUCCESS'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                    }`}
                >
                  {activity.status}
                </span>
                <span className="text-slate-400 whitespace-nowrap">{formatDate(activity.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DETALLE OPERACIÓN MATEMÁTICA */}
      {selectedOperation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Detalle de Operación #{selectedOperation.id}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedOperation.operation_type}</p>
              </div>
              <button
                onClick={() => setSelectedOperation(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Entradas (Inputs):</p>
                <div className="mt-1 max-h-40 overflow-y-auto rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-800">
                  <pre>{JSON.stringify(selectedOperation.inputs, null, 2)}</pre>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Resultado Calculado:</p>
                <div className="mt-1 rounded-lg border border-purple-200 bg-purple-50/50 p-3 font-mono text-xs font-bold text-purple-900">
                  <pre>{JSON.stringify(selectedOperation.result, null, 2)}</pre>
                </div>
              </div>

              <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Estado: <strong>{selectedOperation.status}</strong></span>
                <span>Fecha: {formatDate(selectedOperation.created_at)}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedOperation(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
