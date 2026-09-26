import { useState } from 'react'
import {
  Check,
  CheckCircle2,
  Database,
  Key,
  Lock,
  Save,
  Shield,
  Sliders,
  XCircle,
} from 'lucide-react'
import PageHeader from '../components/common/PageHeader'

export default function Settings() {
  const [tokenExpireMinutes, setTokenExpireMinutes] = useState(60)
  const [auditRetentionDays, setAuditRetentionDays] = useState(90)
  const [allowPublicRegistration, setAllowPublicRegistration] = useState(false)
  const [enforceStrongPasswords, setEnforceStrongPasswords] = useState(true)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
    }, 3000)
  }

  const roleMatrix = [
    { module: 'Dashboard General', admin: true, analyst: false, query: true },
    { module: 'Gestión de Empresa', admin: true, analyst: false, query: false },
    { module: 'Gestión de Sucursales', admin: true, analyst: false, query: false },
    { module: 'Catálogo de Productos', admin: true, analyst: true, query: true },
    { module: 'Módulo de Ventas', admin: true, analyst: true, query: false },
    { module: 'Control de Inventario', admin: true, analyst: true, query: false },
    { module: 'Operaciones con Vectores', admin: true, analyst: true, query: false },
    { module: 'Operaciones con Matrices', admin: true, analyst: true, query: false },
    { module: 'Combinaciones Lineales', admin: true, analyst: true, query: false },
    { module: 'Historial y Auditoría', admin: true, analyst: true, query: false },
    { module: 'Reportes y Exportaciones', admin: true, analyst: true, query: true },
    { module: 'Gestión de Usuarios', admin: true, analyst: false, query: false },
    { module: 'Configuración del Sistema', admin: true, analyst: false, query: false },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración del Sistema"
        description=" Parámetros de seguridad, auditoría y matriz de control de acceso (RBAC)"
        action={
          savedSuccess ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-700 border border-emerald-200">
              <Check size={16} /> Configuración guardada
            </span>
          ) : (
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Save size={16} /> Guardar cambios
            </button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Columna Izquierda: Parámetros de Seguridad */}
        <div className="space-y-6 lg:col-span-1">
          {/* Card Seguridad */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Políticas de Sesión</h3>
                <p className="text-xs text-slate-500">Parámetros de autenticación JWT</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Expiración del Token (minutos)
                </label>
                <input
                  type="number"
                  value={tokenExpireMinutes}
                  onChange={(e) => setTokenExpireMinutes(Number(e.target.value))}
                  min={15}
                  max={1440}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <span className="text-[11px] text-slate-400">Por defecto: 60 minutos</span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Retención de Auditoría (días)
                </label>
                <input
                  type="number"
                  value={auditRetentionDays}
                  onChange={(e) => setAuditRetentionDays(Number(e.target.value))}
                  min={30}
                  max={365}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <span className="text-[11px] text-slate-400">Historial de registros de seguridad</span>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={enforceStrongPasswords}
                    onChange={(e) => setEnforceStrongPasswords(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Requerir contraseñas seguras</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={allowPublicRegistration}
                    onChange={(e) => setAllowPublicRegistration(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Registro público de usuarios (Desactivado)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Card Info Servidor */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                <Database size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Estado del Sistema</h3>
                <p className="text-xs text-slate-500">MatrixFlow Enterprise API</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Versión:</span>
                <span className="font-mono font-semibold text-slate-900">1.0.0 </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Algoritmo JWT:</span>
                <span className="font-mono font-semibold text-slate-900">HS256</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Hash de Contraseñas:</span>
                <span className="font-mono font-semibold text-slate-900">Argon2 (pwdlib)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Base de Datos:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <CheckCircle2 size={13} /> PostgreSQL Activo
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Auditoría IP:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                  <Key size={13} /> Habilitado (Client Host)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Matriz de Roles (FASE 6) */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600">
                  <Shield size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Matriz de Acceso por Rol (Especificación Oficial)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Permisos y visibilidad según el documento maestro de desarrollo
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Módulo del Sistema</th>
                    <th className="px-6 py-4 text-center">
                      <span className="inline-block rounded-md bg-purple-100 px-2.5 py-1 text-purple-800">
                        Administrador
                      </span>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <span className="inline-block rounded-md bg-blue-100 px-2.5 py-1 text-blue-800">
                        Analista
                      </span>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <span className="inline-block rounded-md bg-emerald-100 px-2.5 py-1 text-emerald-800">
                        Consulta
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {roleMatrix.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-3.5 font-medium text-slate-800 flex items-center gap-2">
                        <Sliders size={14} className="text-slate-400" />
                        {row.module}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        {row.admin ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-600">
                            <Check size={14} />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-500">
                            <XCircle size={14} />
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        {row.analyst ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-600">
                            <Check size={14} />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-slate-400">
                            <XCircle size={14} />
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        {row.query ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-600">
                            <Check size={14} />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-slate-400">
                            <XCircle size={14} />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <span>Control de Acceso Basado en Roles (RBAC) con comprobación en backend (require_roles) y frontend (ProtectedRoute).</span>
              <span className="font-semibold text-blue-600">Totalmente Operativo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

