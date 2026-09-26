import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  Calendar,
  CheckCircle2,
  Cpu,
  FileSpreadsheet,
  FileText,
  Filter,
  Printer,
  RefreshCw,
  Shield,
  Target,
  Warehouse,
} from "lucide-react";

import api from "../services/api";
import PageHeader from "../components/common/PageHeader";
import { useAuth } from "../context/AuthContext";
import {
  downloadCSV,
  downloadJSON,
  generateFullReportCSV,
  printExecutiveReport,
  type ExportDataPayload,
} from "../utils/exportUtils";

interface BranchSale {
  branch_id: number;
  branch: string;
  total_sales: number;
  sales_count?: number;
  percentage?: number;
}

interface ProductSale {
  product_id: number;
  product: string;
  total_sales: number;
  quantity_sold: number;
  percentage?: number;
}

interface TargetItem {
  target_id: number;
  branch_id: number;
  branch: string;
  target: string;
  target_value: number;
  sales: number;
  compliance_percentage: number;
  status?: string;
}

interface InventoryItem {
  inventory_id: number;
  product_id: number;
  product: string;
  branch_id: number;
  branch: string;
  quantity: number;
  quantity_sold: number;
  rotation: number;
  status?: string;
  rotation_speed?: string;
}

interface MathOperation {
  id: number;
  operation_type: string;
  inputs?: any[];
  result?: any;
  result_type?: string;
  status: string;
  created_at: string;
}

interface ActivityItem {
  id: number;
  user_id: number | null;
  username?: string;
  action: string;
  module: string;
  ip_address?: string;
  status: string;
  result: string;
  created_at: string;
}

interface ProcessingIndicators {
  total_operations: number;
  completed_operations: number;
  error_operations: number;
  success_rate: number;
  avg_execution_time_ms: number;
  matrix_operations: number;
  vector_operations: number;
  linear_combinations: number;
  engine_status: string;
  active_modules: number;
}

interface ReportResponse {
  report_type: string;
  data: any[];
}

export default function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [salesByBranch, setSalesByBranch] = useState<BranchSale[]>([]);
  const [salesByProduct, setSalesByProduct] = useState<ProductSale[]>([]);
  const [targets, setTargets] = useState<TargetItem[]>([]);
  const [inventoryRotation, setInventoryRotation] = useState<InventoryItem[]>([]);
  const [operations, setOperations] = useState<MathOperation[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [processing, setProcessing] = useState<ProcessingIndicators | null>(null);

  // Filters
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("Todas");
  const [periodFilter, setPeriodFilter] = useState("mes");
  const [activeReportTab, setActiveReportTab] = useState<
    "resumen" | "ventas" | "metas" | "inventario" | "matematicas" | "auditoria"
  >("resumen");

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<ReportResponse>("/api/v1/reports/");
      const sections = response.data.data || [];

      const branchSec = sections.find((s) => s.module === "sales_by_branch");
      if (branchSec?.data) setSalesByBranch(branchSec.data);

      const prodSec = sections.find((s) => s.module === "sales_by_product");
      if (prodSec?.data) setSalesByProduct(prodSec.data);

      const targetSec = sections.find((s) => s.module === "target_compliance");
      if (targetSec?.data) setTargets(targetSec.data);

      const invSec = sections.find((s) => s.module === "inventory_rotation");
      if (invSec?.data) setInventoryRotation(invSec.data);

      const opSec = sections.find((s) => s.module === "operations");
      if (opSec?.data) setOperations(opSec.data);

      const actSec = sections.find((s) => s.module === "recent_activity");
      if (actSec?.data) setRecentActivity(actSec.data);

      const procSec = sections.find((s) => s.module === "processing_indicators");
      if (procSec?.data) setProcessing(procSec.data);
    } catch (err: any) {
      console.error(err);
      setError("No se pudieron cargar los datos de reportes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(value);

  const totalSalesRevenue = salesByBranch.reduce(
    (sum, item) => sum + Number(item.total_sales || 0),
    0
  );

  const totalUnitsSold = salesByProduct.reduce(
    (sum, item) => sum + Number(item.quantity_sold || 0),
    0
  );

  const totalStockItems = inventoryRotation.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const maxBranchSales = Math.max(
    ...salesByBranch.map((branch) => Number(branch.total_sales || 0)),
    1
  );

  const maxProductSales = Math.max(
    ...salesByProduct.map((product) => Number(product.total_sales || 0)),
    1
  );

  // Filtered by branch
  const filteredBranchSales =
    selectedBranchFilter === "Todas"
      ? salesByBranch
      : salesByBranch.filter((b) => b.branch === selectedBranchFilter);

  const filteredTargets =
    selectedBranchFilter === "Todas"
      ? targets
      : targets.filter((t) => t.branch === selectedBranchFilter);

  const filteredInventory =
    selectedBranchFilter === "Todas"
      ? inventoryRotation
      : inventoryRotation.filter((i) => i.branch === selectedBranchFilter);

  // Export package
  const getPayload = (): ExportDataPayload => ({
    salesByBranch: filteredBranchSales,
    salesByProduct,
    targetCompliance: filteredTargets,
    inventoryRotation: filteredInventory,
    operations,
    recentActivity,
    processingIndicators: processing,
    generatedBy: user?.username || "Usuario Reportes",
    dateRange: periodFilter,
  });

  const handleExportCSV = () => {
    const csvContent = generateFullReportCSV(getPayload());
    downloadCSV(`MatrixFlow_Reporte_${activeReportTab}_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
    showToast("Reporte CSV generado exitosamente.");
  };

  const handleExportJSON = () => {
    downloadJSON(`MatrixFlow_Reporte_${activeReportTab}.json`, getPayload());
    showToast("Datos JSON descargados exitosamente.");
  };

  const handlePrintPDF = () => {
    printExecutiveReport(getPayload());
    showToast("Generando vista imprimible / PDF...");
  };

  const handleBackendCSV = async () => {
    try {
      const res = await api.get("/api/v1/reports/export?format=csv", {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte_matrixflow_oficial.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("Descarga completada desde el servidor.");
    } catch {
      handleExportCSV();
    }
  };

  const showToast = (msg: string) => {
    setIsExportOpen(false);
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-6">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-600">Generando reportes de MatrixFlow Enterprise...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 flex items-center gap-3">
          <AlertTriangle size={24} className="text-red-500 shrink-0" />
          <div>
            <h2 className="text-base font-bold">Error al cargar reportes</h2>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Centro de Reportes Empresariales "
        description="Plan Maestro de Desarrollo v1.0: Ventas, Metas, Inventario, Álgebra Lineal, Auditoría y Exportaciones"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchReports}
              className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 transition"
              title="Recargar datos"
            >
              <RefreshCw size={17} />
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <ArrowDownToLine size={17} />
                <span>Exportaciones Futuras</span>
              </button>

              {isExportOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-30">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Formatos de Exportación
                  </div>
                  <button
                    onClick={handlePrintPDF}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Printer size={16} className="text-blue-600" />
                    <div>
                      <p className="font-medium">Exportar a PDF / Impresión</p>
                      <p className="text-[11px] text-slate-400">Formato ejecutivo con membrete</p>
                    </div>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    <FileSpreadsheet size={16} className="text-emerald-600" />
                    <div>
                      <p className="font-medium">Exportar a Excel / CSV</p>
                      <p className="text-[11px] text-slate-400">Con codificación UTF-8 para Excel</p>
                    </div>
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    <FileText size={16} className="text-purple-600" />
                    <div>
                      <p className="font-medium">Exportar a JSON</p>
                      <p className="text-[11px] text-slate-400">Datos estructurados de API</p>
                    </div>
                  </button>
                  <button
                    onClick={handleBackendCSV}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 border-t border-slate-100 mt-1 pt-2 transition"
                  >
                    <ArrowDownToLine size={16} className="text-slate-600" />
                    <div>
                      <p className="font-medium text-xs">Descargar desde API Backend</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        }
      />

      {/* KPI Cards Consolidados */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ventas Acumuladas</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(totalSalesRevenue)}</p>
          <p className="mt-1 text-xs text-slate-500">Total completado en sucursales</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unidades Vendidas</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalUnitsSold}</p>
          <p className="mt-1 text-xs text-slate-500">Unidades en transacciones</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Catálogo & Stock</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalStockItems} uds</p>
          <p className="mt-1 text-xs text-slate-500">{salesByProduct.length} productos registrados</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Motor Matemático</p>
          <p className="mt-2 text-2xl font-bold text-purple-700">{processing?.total_operations ?? operations.length} ops</p>
          <p className="mt-1 text-xs text-slate-500">{processing?.success_rate ?? 100}% tasa de efectividad</p>
        </div>
      </div>

      {/* Filtros de Reporte */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-600 uppercase">Sucursal:</span>
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="Todas">Todas las sucursales</option>
              {salesByBranch.map((b) => (
                <option key={b.branch_id} value={b.branch}>
                  {b.branch}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-600 uppercase">Periodo:</span>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="mes">Mes Actual</option>
              <option value="trimestre">Trimestre Actual</option>
              <option value="anual">Año Fiscal 2026</option>
              <option value="historico">Todo el Histórico</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pestañas de Secciones de Reporte */}
      <div className="flex border-b border-slate-200 bg-white px-3 rounded-xl shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveReportTab("resumen")}
          className={`py-3 px-4 text-xs font-bold uppercase transition border-b-2 whitespace-nowrap ${activeReportTab === "resumen"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
        >
          Resumen Ejecutivo
        </button>
        <button
          onClick={() => setActiveReportTab("ventas")}
          className={`py-3 px-4 text-xs font-bold uppercase transition border-b-2 whitespace-nowrap ${activeReportTab === "ventas"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
        >
          Ventas por Sucursal y Producto
        </button>
        <button
          onClick={() => setActiveReportTab("metas")}
          className={`py-3 px-4 text-xs font-bold uppercase transition border-b-2 whitespace-nowrap ${activeReportTab === "metas"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
        >
          Cumplimiento de Metas
        </button>
        <button
          onClick={() => setActiveReportTab("inventario")}
          className={`py-3 px-4 text-xs font-bold uppercase transition border-b-2 whitespace-nowrap ${activeReportTab === "inventario"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
        >
          Inventario y Rotación
        </button>
        <button
          onClick={() => setActiveReportTab("matematicas")}
          className={`py-3 px-4 text-xs font-bold uppercase transition border-b-2 whitespace-nowrap ${activeReportTab === "matematicas"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
        >
          Resultados de Álgebra Lineal
        </button>
        <button
          onClick={() => setActiveReportTab("auditoria")}
          className={`py-3 px-4 text-xs font-bold uppercase transition border-b-2 whitespace-nowrap ${activeReportTab === "auditoria"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
        >
          Auditoría y Actividad
        </button>
      </div>

      {/* ========================================================
          VISTA 1: RESUMEN EJECUTIVO / TODAS LAS SECCIONES
      ======================================================== */}
      {(activeReportTab === "resumen" || activeReportTab === "ventas") && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Ventas por sucursal */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Ventas por Sucursal</h2>
                <p className="mt-0.5 text-xs text-slate-500">Distribución de ventas completadas</p>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                Total: {formatCurrency(totalSalesRevenue)}
              </span>
            </div>

            <div className="space-y-4 p-6">
              {filteredBranchSales.map((branch) => {
                const pct = (Number(branch.total_sales || 0) / maxBranchSales) * 100;
                return (
                  <div key={branch.branch_id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{branch.branch}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(branch.total_sales)}</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${Math.max(pct, 3)}%` }}
                      />
                    </div>

                    <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                      <span>{branch.sales_count ?? 1} transacciones</span>
                      <span>{Number(branch.percentage || 0).toFixed(1)}% participación</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ventas por producto */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Ventas por Producto</h2>
                <p className="mt-0.5 text-xs text-slate-500">Importe acumulado por artículo</p>
              </div>
              <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded">
                {totalUnitsSold} Unidades
              </span>
            </div>

            <div className="space-y-4 p-6">
              {salesByProduct.map((product) => {
                const pct = (Number(product.total_sales || 0) / maxProductSales) * 100;
                return (
                  <div key={product.product_id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700 truncate">{product.product}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(product.total_sales)}</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-cyan-500"
                        style={{ width: `${Math.max(pct, 3)}%` }}
                      />
                    </div>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {product.quantity_sold} unidades vendidas · {Number(product.percentage || 0).toFixed(1)}% del total
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          VISTA 2: CUMPLIMIENTO DE METAS (FASE 7)
      ======================================================== */}
      {(activeReportTab === "resumen" || activeReportTab === "metas") && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-emerald-600" />
              <div>
                <h2 className="font-semibold text-slate-900">Cumplimiento de Metas</h2>
                <p className="mt-0.5 text-xs text-slate-500">Progreso respecto al valor objetivo por sucursal</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {filteredTargets.map((t) => (
                <div key={t.target_id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold uppercase text-slate-500">{t.branch}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${t.compliance_percentage >= 100
                          ? "bg-emerald-100 text-emerald-700"
                          : t.compliance_percentage >= 50
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                    >
                      {t.status || (t.compliance_percentage >= 100 ? "Cumplida" : "En progreso")}
                    </span>
                  </div>

                  <p className="font-semibold text-sm text-slate-900 mt-1 truncate">{t.target}</p>

                  <div className="mt-3 flex justify-between text-xs text-slate-600">
                    <span>Logrado: <strong>{formatCurrency(t.sales)}</strong></span>
                    <span>Meta: {formatCurrency(t.target_value)}</span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${t.compliance_percentage >= 100 ? "bg-emerald-500" : "bg-blue-600"
                        }`}
                      style={{ width: `${Math.min(t.compliance_percentage, 100)}%` }}
                    />
                  </div>

                  <p className="text-right text-[11px] font-mono text-slate-700 mt-1 font-bold">
                    {t.compliance_percentage}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          VISTA 3: INVENTARIO Y ROTACIÓN (FASE 7)
      ======================================================== */}
      {(activeReportTab === "resumen" || activeReportTab === "inventario") && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Warehouse size={18} className="text-amber-600" />
              <div>
                <h2 className="font-semibold text-slate-900">Inventario y Rotación</h2>
                <p className="mt-0.5 text-xs text-slate-500">Métricas de existencias y velocidad de ventas</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Producto</th>
                  <th className="px-6 py-3">Sucursal</th>
                  <th className="px-6 py-3 text-right">Stock Actual</th>
                  <th className="px-6 py-3 text-right">Unidades Vendidas</th>
                  <th className="px-6 py-3 text-right">Índice de Rotación</th>
                  <th className="px-6 py-3 text-center">Estado</th>
                  <th className="px-6 py-3 text-right">Velocidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => (
                  <tr key={item.inventory_id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3.5 font-medium text-slate-900">{item.product}</td>
                    <td className="px-6 py-3.5 text-slate-600">{item.branch}</td>
                    <td className="px-6 py-3.5 text-right font-mono font-semibold text-slate-800">{item.quantity}</td>
                    <td className="px-6 py-3.5 text-right font-mono text-slate-600">{item.quantity_sold}</td>
                    <td className="px-6 py-3.5 text-right font-mono font-bold text-blue-600">
                      {Number(item.rotation || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.status === "Normal"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-xs font-medium text-slate-500">
                      {item.rotation_speed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          VISTA 4: RESULTADOS DE OPERACIONES MATEMÁTICAS (FASE 7)
      ======================================================== */}
      {(activeReportTab === "resumen" || activeReportTab === "matematicas") && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu size={18} className="text-purple-600" />
              <div>
                <h2 className="font-semibold text-slate-900">Resultados de Operaciones Matemáticas</h2>
                <p className="mt-0.5 text-xs text-slate-500">Registro histórico de cálculos matriciales y vectoriales</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded">
              {operations.length} Operaciones Registradas
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {operations.map((record) => (
              <div
                key={record.id}
                className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/70 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 uppercase font-mono text-xs text-purple-700">
                      {record.operation_type.replace(/_/g, " ")}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-500">
                      #{record.id}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-slate-600 mt-1 truncate max-w-xl">
                    Resultado: {typeof record.result === "object" ? JSON.stringify(record.result) : String(record.result)}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                    {record.status}
                  </span>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(record.created_at).toLocaleString("es-PE")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          VISTA 5: AUDITORÍA Y ACTIVIDAD RECIENTE (FASE 6 & FASE 7)
      ======================================================== */}
      {(activeReportTab === "resumen" || activeReportTab === "auditoria") && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-blue-600" />
              <div>
                <h2 className="font-semibold text-slate-900">Actividad Reciente y Bitácora de Auditoría</h2>
                <p className="mt-0.5 text-xs text-slate-500">Trazabilidad de operaciones, usuarios e IP</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-3.5 gap-2 hover:bg-slate-50 transition">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{activity.result}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Usuario: <strong>{activity.username || "Sistema"}</strong> · Módulo:{" "}
                    <span className="font-mono text-blue-600">{activity.module}</span> · IP:{" "}
                    <span className="font-mono text-slate-400">{activity.ip_address || "127.0.0.1"}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 sm:text-right shrink-0">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${activity.status === "SUCCESS"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                      }`}
                  >
                    {activity.status}
                  </span>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {new Date(activity.created_at).toLocaleString("es-PE")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}