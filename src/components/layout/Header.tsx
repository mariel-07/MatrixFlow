import {
  Bell,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // =========================================================
  // CERRAR SESIÓN
  // Después de cerrar sesión vuelve a la Landing
  // =========================================================

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const roleName = user?.role || 'Administrador'
  const username = user?.username || 'Usuario'

  const initials = username
    .slice(0, 2)
    .toUpperCase()

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Administrador':
        return 'bg-purple-100 text-purple-700 border-purple-200'

      case 'Analista':
        return 'bg-blue-100 text-blue-700 border-blue-200'

      case 'Consulta':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:px-6">

      {/* =====================================================
          IZQUIERDA
      ===================================================== */}

      <div className="flex items-center gap-3">

        {/* Menú móvil */}
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          title="Abrir menú"
        >
          <Menu size={22} />
        </button>

        {/* Buscador */}
        <div className="hidden md:flex md:w-80 lg:w-96">
          <div className="relative w-full">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Buscar..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>
        </div>

      </div>


      {/* =====================================================
          DERECHA
      ===================================================== */}

      <div className="flex items-center gap-3">

        {/* Rol */}
        <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold sm:flex md:inline-flex">

          <ShieldCheck
            size={14}
            className="text-blue-600"
          />

          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getRoleBadgeColor(
              roleName
            )}`}
          >
            {roleName}
          </span>

        </div>


        {/* Notificaciones */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
          title="Notificaciones"
        >
          <Bell size={20} />

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-600" />
        </button>


        {/* Usuario */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-3">

          {/* Nombre y rol */}
          <div className="hidden text-right sm:block">

            <p className="text-sm font-semibold capitalize text-slate-800">
              {username}
            </p>

            <p className="text-xs text-slate-500">
              {roleName}
            </p>

          </div>


          {/* Iniciales */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
            {initials}
          </div>


          {/* Cerrar sesión */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1 rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            title="Cerrar sesión"
          >
            <LogOut size={17} />
          </button>

        </div>

      </div>

    </header>
  )
}