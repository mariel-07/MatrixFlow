import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import { AuthProvider, useAuth } from '../context/AuthContext'

import LandingPage from '../pages/LandingPage'
import MainLayout from '../components/layout/MainLayout'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import Company from '../pages/Company'
import Branches from '../pages/Branches'
import Products from '../pages/Products'
import Sales from '../pages/Sales'
import Inventory from '../pages/Inventory'
import Vectors from '../pages/Vectors'
import Matrices from '../pages/Matrices'
import Operations from '../pages/Operations'
import History from '../pages/History'
import LinearCombinations from '../pages/LinearCombinations'
import Reports from '../pages/Reports'
import Users from '../pages/Users'
import Settings from '../pages/Settings'


// ============================================================
// RUTAS PROTEGIDAS
// ============================================================

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: string[]
}) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Verificando credenciales...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (
    allowedRoles &&
    user &&
    !allowedRoles.includes(user.role)
  ) {
    if (user.role === 'Analista') {
      return <Navigate to="/ventas" replace />
    }

    if (user.role === 'Consulta') {
      return <Navigate to="/reportes" replace />
    }

    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}


// ============================================================
// REDIRECCIÓN DESPUÉS DEL LOGIN
// ============================================================

function AfterLoginRedirect() {
  const { user } = useAuth()

  if (user?.role === 'Analista') {
    return <Navigate to="/ventas" replace />
  }

  if (user?.role === 'Consulta') {
    return <Navigate to="/reportes" replace />
  }

  return <Navigate to="/dashboard" replace />
}


// ============================================================
// RUTAS PRINCIPALES
// ============================================================

export default function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>

          {/* ==================================================
              LANDING PÚBLICA
              /
          ================================================== */}

          <Route
            path="/"
            element={<LandingPage />}
          />


          {/* ==================================================
              LOGIN PÚBLICO
              /login
          ================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />


          {/* ==================================================
              SISTEMA PROTEGIDO
          ================================================== */}

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >

            {/* ==================================================
                DASHBOARD
                /dashboard
            ================================================== */}

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'Administrador',
                    'Analista',
                    'Consulta',
                  ]}
                >
                  <Dashboard />
                </ProtectedRoute>
              }
            />


            {/* ==================================================
                REDIRECCIÓN INTERNA
                /inicio
            ================================================== */}

            <Route
              path="/inicio"
              element={<AfterLoginRedirect />}
            />


            {/* ==================================================
                EMPRESA
                ADMINISTRADOR
            ================================================== */}

            <Route
              path="/empresa"
              element={
                <ProtectedRoute
                  allowedRoles={['Administrador']}
                >
                  <Company />
                </ProtectedRoute>
              }
            />


            {/* ==================================================
                SUCURSALES
                ADMINISTRADOR
            ================================================== */}

            <Route
              path="/sucursales"
              element={
                <ProtectedRoute
                  allowedRoles={['Administrador']}
                >
                  <Branches />
                </ProtectedRoute>
              }
            />


            {/* ==================================================
                PRODUCTOS
                ADMINISTRADOR
            ================================================== */}

            <Route
              path="/productos"
              element={
                <ProtectedRoute
                  allowedRoles={['Administrador']}
                >
                  <Products />
                </ProtectedRoute>
              }
            />


            {/* ==================================================
                USUARIOS
                ADMINISTRADOR
            ================================================== */}

            <Route
              path="/usuarios"
              element={
                <ProtectedRoute
                  allowedRoles={['Administrador']}
                >
                  <Users />
                </ProtectedRoute>
              }
            />


            {/* ==================================================
                CONFIGURACIÓN
                ADMINISTRADOR
            ================================================== */}

            <Route
              path="/configuracion"
              element={
                <ProtectedRoute
                  allowedRoles={['Administrador']}
                >
                  <Settings />
                </ProtectedRoute>
              }
            />


            {/* ==================================================
                VENTAS
                ADMINISTRADOR + ANALISTA
            ================================================== */}

            <Route
              path="/ventas"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'Administrador',
                    'Analista',
                  ]}
                >
                  <Sales />
                </ProtectedRoute>
              }
            />


            {/* ==================================================
                INVENTARIO
                ADMINISTRADOR + ANALISTA
            ================================================== */}

            <Route
              path="/inventario"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'Administrador',
                    'Analista',
                  ]}
                >
                  <Inventory />
                </ProtectedRoute>
              }
            />


            {/* ==================================================
                VECTORES
                ADMINISTRADOR + ANALISTA
            ================================================== */}

            <Route
              path="/vectores"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'Administrador',
                    'Analista',
                  ]}
                >
                  <Vectors />
                </ProtectedRoute>
              }
            />


            {/* ==================================================
                MATRICES
                ADMINISTRADOR + ANALISTA
            ================================================== */}

            <Route
              path="/matrices"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'Administrador',
                    'Analista',
                  ]}
                >
                  <Matrices />
                </ProtectedRoute>
              }
            />


            {/* ==================================================
                OPERACIONES
                ADMINISTRADOR + ANALISTA
            ================================================== */}

            <Route
              path="/operaciones"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'Administrador',
                    'Analista',
                  ]}
                >
                  <Operations />
                </ProtectedRoute>
              }
            />


            {/* ==================================================
                COMBINACIONES LINEALES
                ADMINISTRADOR + ANALISTA
            ================================================== */}

            <Route
              path="/combinaciones-lineales"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'Administrador',
                    'Analista',
                  ]}
                >
                  <LinearCombinations />
                </ProtectedRoute>
              }
            />


            {/* ==================================================
                HISTORIAL
                ADMINISTRADOR + ANALISTA
            ================================================== */}

            <Route
              path="/historial"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'Administrador',
                    'Analista',
                  ]}
                >
                  <History />
                </ProtectedRoute>
              }
            />


            {/* ==================================================
                REPORTES
                TODOS LOS ROLES
            ================================================== */}

            <Route
              path="/reportes"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'Administrador',
                    'Analista',
                    'Consulta',
                  ]}
                >
                  <Reports />
                </ProtectedRoute>
              }
            />

          </Route>


          {/* ==================================================
              RUTA NO ENCONTRADA
              SIEMPRE VUELVE A LANDING
          ================================================== */}

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>

      </BrowserRouter>
    </AuthProvider>
  )
}