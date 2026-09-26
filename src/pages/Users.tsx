import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users as UsersIcon,
  X,
} from 'lucide-react'
import api from '../services/api'
import PageHeader from '../components/common/PageHeader'

interface UserItem {
  id: number
  username: string
  email: string
  role_id: number
  role_name?: string
}

interface RoleItem {
  id: number
  name: string
}

export default function Users() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('Todos')

  // Modal create user
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState<number>(2) // Default Analista
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const fetchUsersAndRoles = async () => {
    try {
      setLoading(true)
      setError('')

      const [usersRes, rolesRes] = await Promise.allSettled([
        api.get<UserItem[]>('/api/v1/users/'),
        api.get<RoleItem[]>('/api/v1/roles/'),
      ])

      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data)
      } else {
        throw new Error('No se pudo obtener la lista de usuarios')
      }

      if (rolesRes.status === 'fulfilled') {
        setRoles(rolesRes.value.data)
      } else {
        // Fallback default roles
        setRoles([
          { id: 1, name: 'Administrador' },
          { id: 2, name: 'Analista' },
          { id: 3, name: 'Consulta' },
        ])
      }
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.detail || 'Error al cargar los usuarios.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsersAndRoles()
  }, [])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!username.trim() || !email.trim() || !password.trim()) {
      setFormError('Por favor completa todos los campos requeridos.')
      return
    }

    if (password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    try {
      setSaving(true)
      await api.post('/api/v1/users/', {
        username: username.trim(),
        email: email.trim(),
        password,
        role_id: Number(selectedRoleId),
      })

      setFormSuccess('Usuario creado exitosamente con auditoría registrada.')
      setUsername('')
      setEmail('')
      setPassword('')

      setTimeout(() => {
        setIsModalOpen(false)
        setFormSuccess('')
        fetchUsersAndRoles()
      }, 1200)
    } catch (err: any) {
      console.error(err)
      setFormError(
        err.response?.data?.detail || 'Error al crear usuario. Verifica los datos.'
      )
    } finally {
      setSaving(false)
    }
  }

  const getRoleName = (user: UserItem) => {
    if (user.role_name) return user.role_name
    const found = roles.find((r) => r.id === user.role_id)
    return found ? found.name : `Rol #${user.role_id}`
  }

  const filteredUsers = users.filter((u) => {
    const roleName = getRoleName(u).toLowerCase()
    const matchesSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole =
      roleFilter === 'Todos' || roleName === roleFilter.toLowerCase()
    return matchesSearch && matchesRole
  })

  const adminCount = users.filter((u) => getRoleName(u) === 'Administrador').length
  const analystCount = users.filter((u) => getRoleName(u) === 'Analista').length
  const queryCount = users.filter((u) => getRoleName(u) === 'Consulta').length

  const getRoleBadge = (roleName: string) => {
    switch (roleName) {
      case 'Administrador':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 border border-purple-200">
            <ShieldAlert size={13} />
            Administrador
          </span>
        )
      case 'Analista':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            <ShieldCheck size={13} />
            Analista
          </span>
        )
      case 'Consulta':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <UserCheck size={13} />
            Consulta
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {roleName}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Usuarios y Roles"
        description=" Control de acceso basado en roles (Administrador, Analista y Consulta)"
        action={
          <div className="flex gap-2">
            <button
              onClick={fetchUsersAndRoles}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Nuevo usuario
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">Total Usuarios</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{users.length}</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
              <UsersIcon size={22} />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">Cuentas activas en la plataforma</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase text-purple-600">Administradores</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{adminCount}</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
              <ShieldAlert size={22} />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">Acceso total a todos los módulos</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase text-blue-600">Analistas</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{analystCount}</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <ShieldCheck size={22} />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">Ventas, inventario, matemáticas y reportes</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase text-emerald-600">Consulta</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{queryCount}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <UserCheck size={22} />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">Dashboard y reportes autorizados</p>
        </div>
      </div>

      {/* Security alert / Policy note */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-900 flex items-start gap-3">
        <Shield size={20} className="text-blue-600 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-blue-950">Matriz de Roles de MatrixFlow Enterprise :</p>
          <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-blue-800">
            <div><strong>• Administrador:</strong> Usuarios, empresa, ventas, inventario, matrices, vectores, operaciones, reportes y configuración.</div>
            <div><strong>• Analista:</strong> Ventas, inventario, matrices, vectores, operaciones y reportes.</div>
            <div><strong>• Consulta:</strong> Dashboard y reportes autorizados.</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por usuario o correo..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Rol:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="Todos">Todos los roles</option>
              <option value="Administrador">Administrador</option>
              <option value="Analista">Analista</option>
              <option value="Consulta">Consulta</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-blue-600" />
            Cargando usuarios...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <AlertCircle size={28} className="mx-auto mb-2 text-red-500" />
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Usuario</th>
                  <th className="px-6 py-3.5">Correo Electrónico</th>
                  <th className="px-6 py-3.5">Rol de Seguridad</th>
                  <th className="px-6 py-3.5">Módulos Asignados</th>
                  <th className="px-6 py-3.5 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const role = getRoleName(u)
                  return (
                    <tr key={u.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">#{u.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-xs">
                            {u.username.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-900">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{u.email}</td>
                      <td className="px-6 py-4">{getRoleBadge(role)}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {role === 'Administrador' && 'Todos los módulos + Auditoría + Usuarios'}
                        {role === 'Analista' && 'Ventas, Inventario, Matrices, Vectores, Reportes'}
                        {role === 'Consulta' && 'Dashboard y Reportes autorizados'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          <CheckCircle2 size={12} />
                          Activo
                        </span>
                      </td>
                    </tr>
                  )
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                      No se encontraron usuarios con los criterios seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Crear Nuevo Usuario</h3>
                <p className="text-xs text-slate-500">Asigna credenciales y rol de acceso</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. carlos.mendez"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos@matrixflow.com"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Contraseña (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Rol de Seguridad
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  {selectedRoleId === 1 && 'Administrador: Acceso completo a todos los módulos y auditoría.'}
                  {selectedRoleId === 2 && 'Analista: Acceso a ventas, inventario, matrices, vectores y reportes.'}
                  {selectedRoleId === 3 && 'Consulta: Acceso exclusivo a Dashboard y reportes autorizados.'}
                </p>
              </div>

              {formError && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
                  {formSuccess}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

