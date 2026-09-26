import {
  ArrowRight,
  BarChart3,
  Boxes,
  BrainCircuit,
  Database,
  Lock,
  ShieldCheck,
  User,
  Warehouse,
} from 'lucide-react'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!username || !password) {
      setError('Completa todos los campos.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await api.post('/api/v1/auth/login', {
        username,
        password,
      })

      const token = response.data.access_token
      const userData = response.data.user

      if (!token) {
        setError('El servidor no devolvió un token de acceso.')
        return
      }

      // Guardar sesión
      login(token, userData)

      // =====================================================
      // REDIRECCIÓN SEGÚN EL ROL
      // =====================================================

      if (userData?.role === 'Analista') {
        navigate('/ventas', { replace: true })
      } else if (userData?.role === 'Consulta') {
        navigate('/reportes', { replace: true })
      } else {
        // Administrador
        navigate('/dashboard', { replace: true })
      }

    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        'No se pudo iniciar sesión. Verifica tus credenciales.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] lg:flex">

      {/* =====================================================
          PANEL CORPORATIVO
      ====================================================== */}
      <section className="relative hidden min-h-screen overflow-hidden bg-[#0F172A] lg:flex lg:w-[58%]">

        {/* ELEMENTOS DECORATIVOS DE FONDO */}
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full border border-blue-500/10" />

        <div className="absolute -bottom-52 -left-40 h-[600px] w-[600px] rounded-full border border-cyan-400/10" />

        <div className="absolute right-24 top-1/3 h-32 w-32 rounded-full bg-blue-600/5 blur-3xl" />

        <div className="relative z-10 flex w-full flex-col justify-between px-12 py-10 xl:px-16">

          {/* BRANDING */}
          <div>

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                <img
                  src="/logo-matrixflow.png"
                  alt="MatrixFlow Enterprise"
                  className="h-14 w-14 object-contain"
                />
              </div>

              <div>

                <h1 className="text-2xl font-bold tracking-tight text-white">
                  MatrixFlow
                </h1>

                <div className="mt-1 flex items-center gap-2">

                  <span className="h-1.5 w-1.5 rounded-full bg-[#06B6D4]" />

                  <span className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                    ENTERPRISE
                  </span>

                </div>

              </div>

            </div>

            <div className="mt-8 h-px w-24 bg-gradient-to-r from-[#2563EB] to-[#06B6D4]" />

          </div>


          {/* CONTENIDO PRINCIPAL */}
          <div className="max-w-2xl">

            <div className="mb-5 flex items-center gap-2">

              <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                Plataforma empresarial
              </span>

              <span className="text-[10px] text-slate-600">
                v1.0
              </span>

            </div>

            <h2 className="text-4xl font-bold leading-[1.12] tracking-tight text-white xl:text-5xl">

              Convierte datos
              <br />

              <span className="text-[#2563EB]">
                en análisis empresarial.
              </span>

            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400">
              Centraliza ventas, inventario, sucursales y productos
              y transforma la información empresarial en vectores,
              matrices e indicadores para apoyar el análisis y la
              toma de decisiones.
            </p>


            {/* FLUJO ANALÍTICO */}
            <div className="mt-9 flex max-w-xl items-center">

              {/* DATOS */}
              <div className="flex flex-1 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/60">
                  <Database
                    size={18}
                    className="text-[#06B6D4]"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-white">
                    Datos
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Ventas e inventario
                  </p>
                </div>

              </div>

              <ArrowRight
                size={15}
                className="mx-3 shrink-0 text-slate-700"
              />


              {/* ÁLGEBRA */}
              <div className="flex flex-1 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/60">
                  <BrainCircuit
                    size={18}
                    className="text-blue-400"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-white">
                    Álgebra lineal
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Vectores y matrices
                  </p>
                </div>

              </div>

              <ArrowRight
                size={15}
                className="mx-3 shrink-0 text-slate-700"
              />


              {/* RESULTADOS */}
              <div className="flex flex-1 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/60">
                  <BarChart3
                    size={18}
                    className="text-[#06B6D4]"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-white">
                    Indicadores
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Análisis y reportes
                  </p>
                </div>

              </div>

            </div>


            {/* MÓDULOS */}
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">

              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">

                <div className="mb-2 flex items-center gap-2">

                  <BarChart3
                    size={15}
                    className="text-blue-400"
                  />

                  <span className="text-[11px] font-semibold text-slate-300">
                    Ventas
                  </span>

                </div>

                <p className="text-[10px] leading-4 text-slate-500">
                  Análisis por sucursal y producto.
                </p>

              </div>


              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">

                <div className="mb-2 flex items-center gap-2">

                  <Warehouse
                    size={15}
                    className="text-cyan-400"
                  />

                  <span className="text-[11px] font-semibold text-slate-300">
                    Inventario
                  </span>

                </div>

                <p className="text-[10px] leading-4 text-slate-500">
                  Existencias y movimientos.
                </p>

              </div>


              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">

                <div className="mb-2 flex items-center gap-2">

                  <Boxes
                    size={15}
                    className="text-blue-400"
                  />

                  <span className="text-[11px] font-semibold text-slate-300">
                    Indicadores
                  </span>

                </div>

                <p className="text-[10px] leading-4 text-slate-500">
                  Resultados y reportes.
                </p>

              </div>

            </div>

          </div>


          {/* FOOTER TÉCNICO */}
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-5">

            <div className="flex items-center gap-2">

              <ShieldCheck
                size={15}
                className="text-[#06B6D4]"
              />

              <span className="text-[10px] text-slate-500">
                Acceso seguro ·
              </span>

            </div>

            <span className="text-[10px] text-slate-600">
              michi
            </span>

          </div>

        </div>

      </section>


      {/* =====================================================
          PANEL DE AUTENTICACIÓN
      ====================================================== */}
      <section className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFC] px-6 py-10 lg:w-[42%]">

        <div className="w-full max-w-md">

          {/* BRANDING MOBILE */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center">
              <img
                src="/logo-matrixflow.png"
                alt="MatrixFlow Enterprise"
                className="h-12 w-12 object-contain"
              />
            </div>

            <div>

              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                MatrixFlow
              </h1>

              <div className="mt-0.5 flex items-center gap-1.5">

                <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />

                <p className="text-[9px] font-semibold tracking-[0.18em] text-slate-500">
                  ENTERPRISE
                </p>

              </div>

            </div>

          </div>


          {/* CABECERA DEL LOGIN */}
          <div className="mb-8">

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#2563EB]">
              Acceso al sistema
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">
              Iniciar sesión
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#64748B]">
              Accede a tu espacio de trabajo para gestionar
              y analizar la información empresarial.
            </p>

          </div>


          {/* FORMULARIO */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* USUARIO */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                  Usuario
                </label>

                <div className="relative">

                  <User
                    size={18}
                    strokeWidth={1.8}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]"
                  />

                  <input
                    type="text"
                    value={username}
                    onChange={(event) =>
                      setUsername(event.target.value)
                    }
                    placeholder="Ingresa tu usuario"
                    autoComplete="username"
                    className="
                      w-full
                      rounded-lg
                      border border-slate-200
                      bg-slate-50
                      py-3
                      pl-11
                      pr-4
                      text-sm
                      text-[#0F172A]
                      outline-none
                      transition-all
                      placeholder:text-slate-400
                      focus:border-[#2563EB]
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />

                </div>

              </div>


              {/* CONTRASEÑA */}
              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label className="block text-sm font-semibold text-[#0F172A]">
                    Contraseña
                  </label>

                  <span className="text-[10px] font-medium text-[#64748B]">
                    Acceso protegido
                  </span>

                </div>

                <div className="relative">

                  <Lock
                    size={18}
                    strokeWidth={1.8}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]"
                  />

                  <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Ingresa tu contraseña"
                    autoComplete="current-password"
                    className="
                      w-full
                      rounded-lg
                      border border-slate-200
                      bg-slate-50
                      py-3
                      pl-11
                      pr-4
                      text-sm
                      text-[#0F172A]
                      outline-none
                      transition-all
                      placeholder:text-slate-400
                      focus:border-[#2563EB]
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />

                </div>

              </div>


              {/* ERROR */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 p-3">

                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

                  <p className="text-sm leading-5 text-red-600">
                    {error}
                  </p>

                </div>
              )}


              {/* BOTÓN */}
              <button
                type="submit"
                disabled={loading}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-[#2563EB]
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  shadow-blue-600/20
                  transition-all
                  hover:bg-blue-700
                  hover:shadow-md
                  hover:shadow-blue-600/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading
                  ? 'Validando acceso...'
                  : 'Ingresar al sistema'}

                {!loading && (
                  <ArrowRight size={18} />
                )}
              </button>

            </form>


            {/* SEGURIDAD */}
            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50">

                <ShieldCheck
                  size={16}
                  className="text-[#2563EB]"
                />

              </div>

              <p className="text-[10px] leading-4 text-slate-500">
                Tu acceso está protegido mediante autenticación
                y control de permisos según el rol asignado.
              </p>

            </div>

          </div>


          {/* PIE */}
          <div className="mt-6 text-center">

            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              MatrixFlow Enterprise
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Sistema Web Empresarial de Análisis
              de Ventas, Inventario e Indicadores
            </p>

          </div>

        </div>

      </section>

    </div>
  )
}