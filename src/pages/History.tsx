import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  Globe,
  History as HistoryIcon,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import { initialHistory } from "../data/historyMockData";
import type { HistoryRecord } from "../types/history";
import api from "../services/api";

interface AuditRecord {
  id: number;
  user_id: number | null;
  username: string;
  action: string;
  module: string;
  ip_address: string;
  status: string;
  result: string;
  created_at: string;
}

export default function History() {
  const [activeTab, setActiveTab] = useState<"math" | "audit">("audit");

  // --- Operaciones Matemáticas State ---
  const [history, setHistory] = useState<HistoryRecord[]>(initialHistory);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  // --- Auditoría (Fase 6) State ---
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState("");
  const [auditSearch, setAuditSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedAudit, setSelectedAudit] = useState<AuditRecord | null>(null);

  const fetchAuditLogs = async () => {
    try {
      setAuditLoading(true);
      setAuditError("");
      const res = await api.get<AuditRecord[]>("/api/v1/audit-logs/");
      setAuditLogs(res.data);
    } catch (err: any) {
      console.error(err);
      setAuditError("No se pudieron cargar los registros de auditoría.");
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Filter math history
  const filteredHistory = useMemo(() => {
    const searchValue = search.toLowerCase().trim();
    return history.filter((record) => {
      const matchesSearch =
        record.operation.toLowerCase().includes(searchValue) ||
        record.input.toLowerCase().includes(searchValue) ||
        record.result.toLowerCase().includes(searchValue);
      const matchesCategory =
        categoryFilter === "Todas" || record.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [history, search, categoryFilter]);

  // Filter audit logs
  const filteredAuditLogs = useMemo(() => {
    const searchValue = auditSearch.toLowerCase().trim();
    return auditLogs.filter((log) => {
      const matchesSearch =
        log.username.toLowerCase().includes(searchValue) ||
        log.module.toLowerCase().includes(searchValue) ||
        log.action.toLowerCase().includes(searchValue) ||
        (log.result && log.result.toLowerCase().includes(searchValue)) ||
        (log.ip_address && log.ip_address.includes(searchValue));

      const matchesModule =
        moduleFilter === "Todos" ||
        log.module.toUpperCase() === moduleFilter.toUpperCase();

      const matchesStatus =
        statusFilter === "Todos" ||
        log.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesModule && matchesStatus;
    });
  }, [auditLogs, auditSearch, moduleFilter, statusFilter]);

  const completedOperations = history.filter(
    (record) => record.status === "Completada"
  ).length;

  const errorOperations = history.filter(
    (record) => record.status === "Error"
  ).length;

  const successAuditCount = auditLogs.filter(
    (a) => a.status.toUpperCase() === "SUCCESS"
  ).length;

  const failedAuditCount = auditLogs.filter(
    (a) => a.status.toUpperCase() === "FAILED"
  ).length;

  const clearHistory = () => {
    const confirmed = window.confirm(
      "¿Deseas eliminar las operaciones del historial en memoria?"
    );
    if (!confirmed) return;
    setHistory([]);
  };

  const deleteRecord = (id: number) => {
    setHistory((current) => current.filter((record) => record.id !== id));
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString("es-PE", {
        dateStyle: "short",
        timeStyle: "medium",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historial y Auditoría del Sistema"
        description=" Registro detallado de usuario, acción, módulo, fecha, IP, estado y resultado"
        action={
          <div className="flex gap-2">
            {activeTab === "audit" ? (
              <button
                onClick={fetchAuditLogs}
                disabled={auditLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw size={16} className={auditLoading ? "animate-spin" : ""} />
                Actualizar auditoría
              </button>
            ) : (
              <button
                onClick={clearHistory}
                disabled={history.length === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={17} />
                Limpiar historial
              </button>
            )}
          </div>
        }
      />

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-sm">
        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 border-b-2 py-4 px-4 text-sm font-semibold transition ${activeTab === "audit"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
        >
          <Shield size={18} />
          Bitácora de Auditoría de Seguridad 
          <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
            {auditLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("math")}
          className={`flex items-center gap-2 border-b-2 py-4 px-4 text-sm font-semibold transition ${activeTab === "math"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
        >
          <HistoryIcon size={18} />
          Historial de Operaciones Matemáticas
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {history.length}
          </span>
        </button>
      </div>

      {activeTab === "audit" ? (
        /* ====================================================
           TAB DE AUDITORÍA (FASE 6)
        ==================================================== */
        <div className="space-y-6">
          {/* Estadísticas de Auditoría */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total eventos auditados</p>
                  <p className="text-2xl font-bold text-slate-900">{auditLogs.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Acciones exitosas</p>
                  <p className="text-2xl font-bold text-emerald-600">{successAuditCount}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-50 p-2.5 text-red-600">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Intentos / Errores</p>
                  <p className="text-2xl font-bold text-red-600">{failedAuditCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros de Auditoría */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_200px_180px]">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Buscar por usuario, IP, módulo o resultado..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="relative">
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Todos">Todos los módulos</option>
                  <option value="AUTH">AUTH (Inicio de sesión)</option>
                  <option value="USERS">USERS (Usuarios)</option>
                  <option value="SALES">SALES (Ventas)</option>
                  <option value="INVENTORY">INVENTORY (Inventario)</option>
                  <option value="MATRICES">MATRICES (Matrices)</option>
                  <option value="VECTORS">VECTORS (Vectores)</option>
                  <option value="OPERATIONS">OPERATIONS (Operaciones)</option>
                  <option value="COMPANIES">COMPANIES (Empresa)</option>
                  <option value="BRANCHES">BRANCHES (Sucursales)</option>
                </select>
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Todos">Todos los estados</option>
                  <option value="SUCCESS">Exitoso (SUCCESS)</option>
                  <option value="FAILED">Fallido (FAILED)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de Auditoría */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {auditLoading ? (
              <div className="p-12 text-center text-slate-500">
                <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-blue-600" />
                Cargando bitácora de auditoría...
              </div>
            ) : auditError ? (
              <div className="p-8 text-center text-red-600">{auditError}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5">Fecha y Hora</th>
                      <th className="px-5 py-3.5">Usuario</th>
                      <th className="px-5 py-3.5">Acción</th>
                      <th className="px-5 py-3.5">Módulo</th>
                      <th className="px-5 py-3.5">Dirección IP</th>
                      <th className="px-5 py-3.5">Estado</th>
                      <th className="px-5 py-3.5">Resultado</th>
                      <th className="px-5 py-3.5 text-right">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="transition hover:bg-slate-50/80">
                        <td className="px-5 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <User size={13} className="text-slate-400" />
                            <span>{log.username}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-100">
                            {log.module}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                          <div className="flex items-center gap-1">
                            <Globe size={13} className="text-slate-400" />
                            {log.ip_address}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {log.status.toUpperCase() === "SUCCESS" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 size={12} /> Exitoso
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
                              <AlertTriangle size={12} /> Fallido
                            </span>
                          )}
                        </td>
                        <td className="max-w-[280px] px-5 py-3.5 truncate text-xs text-slate-600 font-mono">
                          {log.result}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedAudit(log)}
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition"
                            title="Ver registro completo"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredAuditLogs.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                          No se encontraron eventos de auditoría con los filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ====================================================
           TAB DE HISTORIAL MATEMÁTICO
        ==================================================== */
        <div className="space-y-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                  <HistoryIcon size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total operaciones</p>
                  <p className="text-2xl font-bold text-slate-900">{history.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Completadas</p>
                  <p className="text-2xl font-bold text-slate-900">{completedOperations}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-50 p-2.5 text-red-600">
                  <Clock3 size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Operaciones con error</p>
                  <p className="text-2xl font-bold text-slate-900">{errorOperations}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar operación..."
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="relative">
                <Filter size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Todas">Todas las categorías</option>
                  <option value="Vector">Vectores</option>
                  <option value="Matriz">Matrices</option>
                  <option value="Combinación lineal">Combinaciones lineales</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de operaciones */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Fecha</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Categoría</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Operación</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Entrada</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Resultado</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">Estado</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.map((record) => (
                    <tr key={record.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays size={15} className="text-slate-400" />
                          {record.createdAt}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${record.category === "Vector"
                              ? "bg-blue-50 text-blue-700"
                              : record.category === "Matriz"
                                ? "bg-cyan-50 text-cyan-700"
                                : "bg-violet-50 text-violet-700"
                            }`}
                        >
                          {record.category}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">{record.operation}</p>
                      </td>

                      <td className="max-w-[220px] px-5 py-4">
                        <p className="truncate text-sm text-slate-600">{record.input}</p>
                      </td>

                      <td className="max-w-[220px] px-5 py-4">
                        <p className="truncate font-mono text-sm text-slate-700">{record.result}</p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                          <CheckCircle2 size={13} />
                          {record.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            title="Ver detalle"
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            onClick={() => deleteRecord(record.id)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            title="Eliminar"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                        No se encontraron operaciones registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Auditoría */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 p-5 bg-slate-50">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Registro de Auditoría #{selectedAudit.id}
                </h2>
              </div>
              <button
                onClick={() => setSelectedAudit(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase text-slate-400 font-semibold">Usuario</p>
                  <p className="font-semibold text-slate-900 mt-1">{selectedAudit.username}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400 font-semibold">Dirección IP</p>
                  <p className="font-mono text-slate-900 mt-1">{selectedAudit.ip_address}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase text-slate-400 font-semibold">Módulo</p>
                  <p className="font-semibold text-blue-600 mt-1">{selectedAudit.module}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400 font-semibold">Acción</p>
                  <p className="font-mono font-semibold text-slate-900 mt-1">{selectedAudit.action}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-400 font-semibold">Fecha y Hora</p>
                <p className="text-slate-700 mt-1">{formatDate(selectedAudit.created_at)}</p>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-400 font-semibold">Estado</p>
                <div className="mt-1">
                  {selectedAudit.status.toUpperCase() === "SUCCESS" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={13} /> Operación Exitosa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 border border-red-200">
                      <AlertTriangle size={13} /> Fallido / Bloqueado
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-400 font-semibold">Detalle del Resultado</p>
                <div className="mt-1 rounded-lg bg-slate-50 border border-slate-200 p-3 font-mono text-xs text-slate-800 break-words">
                  {selectedAudit.result}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 p-4">
              <button
                onClick={() => setSelectedAudit(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Operación Matemática */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Detalle de operación</h2>
                <p className="text-sm text-slate-500">Registro #{selectedRecord.id}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Categoría</p>
                <p className="mt-1 font-medium text-slate-900">{selectedRecord.category}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Operación</p>
                <p className="mt-1 font-medium text-slate-900">{selectedRecord.operation}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Entrada</p>
                <div className="mt-2 rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-700">
                  {selectedRecord.input}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Resultado</p>
                <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 font-mono text-xs font-semibold text-emerald-700">
                  {selectedRecord.result}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Fecha y hora</p>
                <p className="mt-1 text-xs text-slate-600">{selectedRecord.createdAt}</p>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 p-4">
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}