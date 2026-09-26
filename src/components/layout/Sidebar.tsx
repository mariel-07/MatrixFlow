
import {
  BarChart3,
  Building2,
  Boxes,
  Calculator,
  ClipboardList,
  Database,
  FileBarChart,
  History,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Users,
  Warehouse,
  X,
  Shield,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItem {
  label: string
  icon: any
  path: string
  roles: string[]
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

const allMenuSections: MenuSection[] = [
  {
    title: 'PRINCIPAL',
    items: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/',
        roles: ['Administrador', 'Consulta'],
      },
    ],
  },
  {
    title: 'EMPRESA',
    items: [
      {
        label: 'Empresa',
        icon: Building2,
        path: '/empresa',
        roles: ['Administrador'],
      },
      {
        label: 'Sucursales',
        icon: Database,
        path: '/sucursales',
        roles: ['Administrador'],
      },
      {
        label: 'Productos',
        icon: Boxes,
        path: '/productos',
        roles: ['Administrador'],
      },
    ],
  },
  {
    title: 'OPERACIONES',
    items: [
      {
        label: 'Ventas',
        icon: ShoppingCart,
        path: '/ventas',
        roles: ['Administrador', 'Analista'],
      },
      {
        label: 'Inventario',
        icon: Warehouse,
        path: '/inventario',
        roles: ['Administrador', 'Analista'],
      },
    ],
  },
  {
    title: 'ANÁLISIS MATEMÁTICO',
    items: [
      {
        label: 'Vectores',
        icon: BarChart3,
        path: '/vectores',
        roles: ['Administrador', 'Analista'],
      },
      {
        label: 'Matrices',
        icon: Calculator,
        path: '/matrices',
        roles: ['Administrador', 'Analista'],
      },
      {
        label: 'Operaciones',
        icon: Calculator,
        path: '/operaciones',
        roles: ['Administrador', 'Analista'],
      },
      {
        label: 'Combinaciones lineales',
        icon: ClipboardList,
        path: '/combinaciones-lineales',
        roles: ['Administrador', 'Analista'],
      },
    ],
  },
  {
    title: 'GESTIÓN',
    items: [
      {
        label: 'Historial y Auditoría',
        icon: History,
        path: '/historial',
        roles: ['Administrador', 'Analista'],
      },
      {
        label: 'Reportes',
        icon: FileBarChart,
        path: '/reportes',
        roles: ['Administrador', 'Analista', 'Consulta'],
      },
      {
        label: 'Usuarios',
        icon: Users,
        path: '/usuarios',
        roles: ['Administrador'],
      },
      {
        label: 'Configuración',
        icon: Settings,
        path: '/configuracion',
        roles: ['Administrador'],
      },
    ],
  },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth()
  const location = useLocation()
  const userRole = user?.role || 'Administrador'

  const visibleSections = allMenuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.roles.includes(userRole)
      ),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-72
          bg-[#0F172A] text-white
          border-r border-slate-800/80
          transition-transform duration-300
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >

        {/* =====================================================
            BRANDING
        ====================================================== */}
        <div className="flex h-[76px] items-center justify-between border-b border-slate-800/80 px-5">

          <div className="flex items-center gap-3">

            {/* LOGO SIN CUADRO */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center">
              <img
                src="/logo-matrixflow.png"
                alt="MatrixFlow"
                className="h-11 w-11 object-contain"
              />
            </div>

            {/* IDENTIDAD */}
            <div className="flex flex-col">
              <h1 className="text-[17px] font-bold tracking-tight text-white leading-none">
                MatrixFlow
              </h1>

              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#06B6D4]" />

                <p className="text-[9px] font-semibold tracking-[0.18em] text-[#94A3B8]">
                  ENTERPRISE
                </p>
              </div>
            </div>

          </div>

          {/* CERRAR EN MÓVIL */}
          <button
            onClick={onClose}
            className="
              rounded-lg p-2
              text-[#64748B]
              transition
              hover:bg-slate-800
              hover:text-white
              lg:hidden
            "
          >
            <X size={20} />
          </button>

        </div>

        {/* =====================================================
            ROL ACTUAL
        ====================================================== */}
        <div className="mx-4 my-4 rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-2.5">

          <div className="flex items-center gap-2">

            <Shield
              size={14}
              className="shrink-0 text-[#06B6D4]"
            />

            <span className="text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
              Acceso:
            </span>

            <span className="truncate text-xs font-semibold text-white">
              {userRole}
            </span>

          </div>

        </div>

        {/* =====================================================
            NAVEGACIÓN
        ====================================================== */}
        <nav className="h-[calc(100vh-9.5rem)] overflow-y-auto px-3 py-2">

          {visibleSections.map((section) => (

            <div
              key={section.title}
              className="mb-5"
            >

              {/* TÍTULO */}
              <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.16em] text-[#64748B]">
                {section.title}
              </p>

              {/* ITEMS */}
              <div className="space-y-1">

                {section.items.map((item) => {

                  const Icon = item.icon
                  const isActive =
                    location.pathname === item.path

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`
                        group
                        flex items-center gap-3
                        rounded-lg
                        px-3 py-2.5
                        text-sm font-medium
                        transition-all duration-200

                        ${
                          isActive
                            ? `
                              bg-[#2563EB]
                              text-white
                              shadow-sm
                              shadow-blue-600/30
                            `
                            : `
                              text-slate-300
                              hover:bg-slate-800/80
                              hover:text-white
                            `
                        }
                      `}
                    >

                      <Icon
                        size={18}
                        strokeWidth={1.8}
                        className={`
                          transition-colors
                          ${
                            isActive
                              ? 'text-white'
                              : 'text-[#64748B] group-hover:text-[#06B6D4]'
                          }
                        `}
                      />

                      <span>
                        {item.label}
                      </span>

                    </Link>
                  )
                })}

              </div>

            </div>

          ))}

        </nav>

      </aside>
    </>
  )
}
