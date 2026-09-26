import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronRight,
  Database,
  FileBarChart,
  Layers3,
  LockKeyhole,
  Menu,
  Network,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Target,
  Warehouse,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const goToLogin = () => {
    setMenuOpen(false)
    navigate('/login')
  }

  const scrollToSection = (id: string) => {
    setMenuOpen(false)

    const element = document.getElementById(id)

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F8FAFC] text-[#0F172A]">

      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#0F172A]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

          {/* LOGO */}
          <button
            onClick={() => scrollToSection('inicio')}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <img
                src="/logo-matrixflow.png"
                alt="MatrixFlow"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="text-left">
              <p className="text-lg font-bold tracking-tight text-white">
                MatrixFlow
              </p>

              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
                Enterprise
              </p>
            </div>
          </button>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-8 lg:flex">
            <button
              onClick={() => scrollToSection('solucion')}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Solución
            </button>

            <button
              onClick={() => scrollToSection('modulos')}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Módulos
            </button>

            <button
              onClick={() => scrollToSection('analisis')}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Análisis
            </button>

            <button
              onClick={() => scrollToSection('arquitectura')}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Arquitectura
            </button>
          </nav>

          {/* LOGIN DESKTOP */}
          <div className="hidden lg:block">
            <button
              onClick={goToLogin}
              className="group flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-500"
            >
              Ingresar
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white lg:hidden"
            aria-label="Abrir menú"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* MOBILE NAV */}
        {menuOpen && (
          <div className="border-t border-white/10 bg-[#0F172A] px-6 py-5 lg:hidden">
            <div className="flex flex-col gap-2">

              <button
                onClick={() => scrollToSection('solucion')}
                className="rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Solución
              </button>

              <button
                onClick={() => scrollToSection('modulos')}
                className="rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Módulos
              </button>

              <button
                onClick={() => scrollToSection('analisis')}
                className="rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Análisis
              </button>

              <button
                onClick={() => scrollToSection('arquitectura')}
                className="rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Arquitectura
              </button>

              <button
                onClick={goToLogin}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white"
              >
                Ingresar
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================
          HERO
      ========================================================= */}
      <section
        id="inicio"
        className="relative min-h-screen overflow-hidden bg-[#0F172A] pt-20"
      >
        {/* Glow superior derecho */}
        <div className="absolute -right-40 top-10 h-[600px] w-[600px] rounded-full bg-[#2563EB]/20 blur-3xl" />

        {/* Glow inferior izquierdo */}
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#06B6D4]/10 blur-3xl" />

        {/* Glow central */}
        <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/5 blur-3xl" />

        {/* GRID DE FONDO */}
        <div className="absolute inset-0 opacity-[0.035]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* CONTENIDO */}
        <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center px-6 py-20 lg:px-8 lg:py-24">

          <div className="grid w-full items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">

            {/* TEXTO */}
            <div>

              {/* Badge */}
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
                <Sparkles className="h-4 w-4" />
                Plataforma empresarial de análisis
              </div>

              {/* TÍTULO */}
              <h1 className="max-w-4xl text-5xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Convierte tus datos
                <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
                  en decisiones.
                </span>
              </h1>

              {/* DESCRIPCIÓN */}
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                MatrixFlow Enterprise centraliza ventas, inventario,
                sucursales, metas e indicadores para transformar la
                información empresarial en análisis matemático y decisiones
                estratégicas.
              </p>

              {/* BOTONES */}
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">

                <button
                  onClick={goToLogin}
                  className="group inline-flex items-center justify-center gap-3 rounded-xl bg-[#2563EB] px-7 py-4 font-semibold text-white shadow-xl shadow-blue-950/30 transition hover:bg-blue-500"
                >
                  Ingresar a MatrixFlow
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => scrollToSection('solucion')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-4 font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
                >
                  Conocer la plataforma
                  <ChevronRight className="h-5 w-5" />
                </button>

              </div>

              {/* INDICADORES */}
              <div className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-white/10 pt-7">

                <div>
                  <p className="text-2xl font-bold text-white">
                    100%
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Centralizado
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold text-white">
                    24/7
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Disponibilidad
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold text-white">
                    360°
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Visión empresarial
                  </p>
                </div>

              </div>
            </div>

            {/* =====================================================
                DASHBOARD VISUAL
            ===================================================== */}
            <div className="relative">

              <div className="absolute -inset-8 rounded-[50px] bg-blue-500/10 blur-3xl" />

              <div className="relative rounded-[28px] border border-white/10 bg-white/[0.07] p-3 shadow-2xl backdrop-blur-xl">

                <div className="rounded-[22px] border border-white/10 bg-[#111827] p-6">

                  {/* HEADER DASHBOARD */}
                  <div className="mb-6 flex items-center justify-between">

                    <div>
                      <p className="text-sm font-medium text-slate-400">
                        Panel empresarial
                      </p>

                      <p className="mt-1 text-lg font-semibold text-white">
                        Resumen general
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                      <BarChart3 className="h-5 w-5" />
                    </div>

                  </div>

                  {/* KPIs */}
                  <div className="grid grid-cols-2 gap-4">

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                          Ventas
                        </span>

                        <ShoppingCart className="h-4 w-4 text-blue-400" />
                      </div>

                      <p className="text-2xl font-bold text-white">
                        S/ 48,920
                      </p>

                      <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
                        <ArrowRight className="h-3 w-3 -rotate-45" />
                        12.8% este mes
                      </div>

                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                          Inventario
                        </span>

                        <Warehouse className="h-4 w-4 text-cyan-400" />
                      </div>

                      <p className="text-2xl font-bold text-white">
                        1,284
                      </p>

                      <div className="mt-2 text-xs text-slate-400">
                        unidades disponibles
                      </div>

                    </div>

                  </div>

                  {/* GRÁFICO */}
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">

                    <div className="mb-5 flex items-center justify-between">

                      <div>
                        <p className="text-sm font-medium text-white">
                          Rendimiento
                        </p>

                        <p className="text-xs text-slate-500">
                          Evolución mensual
                        </p>
                      </div>

                      <div className="rounded-lg bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                        +18.4%
                      </div>

                    </div>

                    <div className="flex h-32 items-end gap-3">

                      {[35, 48, 42, 67, 58, 76, 69, 91, 82, 100].map(
                        (height, index) => (
                          <div
                            key={index}
                            className="flex-1 rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-400 opacity-90 transition hover:opacity-100"
                            style={{ height: `${height}%` }}
                          />
                        ),
                      )}

                    </div>

                  </div>

                  {/* FOOTER DASHBOARD */}
                  <div className="mt-4 grid grid-cols-3 gap-3">

                    <div className="rounded-xl bg-white/[0.04] p-3">
                      <p className="text-[11px] text-slate-500">
                        Sucursales
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        05
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/[0.04] p-3">
                      <p className="text-[11px] text-slate-500">
                        Productos
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        248
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/[0.04] p-3">
                      <p className="text-[11px] text-slate-500">
                        Indicadores
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        32
                      </p>
                    </div>

                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SCROLL INDICATOR */}
        <div className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-slate-500">
            Explorar
          </span>

          <div className="h-10 w-px bg-gradient-to-b from-slate-500 to-transparent" />
        </div>

      </section>

      {/* =========================================================
          SOLUCIÓN
      ========================================================= */}
      <section
        id="solucion"
        className="scroll-mt-20 border-t border-slate-200/70 bg-[#F8FAFC] py-24 lg:py-28"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="mx-auto max-w-3xl text-center">

            <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
              La solución
            </span>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl lg:text-5xl">
              Una plataforma para toda tu operación
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#64748B]">
              Integra la información de las diferentes áreas de tu empresa
              en un solo entorno para facilitar el análisis y seguimiento
              de resultados.
            </p>

          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">

            {/* CARD 1 */}
            <div className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                <Database className="h-7 w-7" />
              </div>

              <h3 className="mt-6 text-xl font-bold text-[#0F172A]">
                Datos centralizados
              </h3>

              <p className="mt-3 leading-7 text-[#64748B]">
                Gestiona ventas, productos, inventario, sucursales,
                metas e indicadores desde una plataforma integrada.
              </p>

            </div>

            {/* CARD 2 */}
            <div className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 transition group-hover:bg-cyan-500 group-hover:text-white">
                <BrainCircuit className="h-7 w-7" />
              </div>

              <h3 className="mt-6 text-xl font-bold text-[#0F172A]">
                Análisis matemático
              </h3>

              <p className="mt-3 leading-7 text-[#64748B]">
                Representa información empresarial mediante vectores,
                matrices y operaciones matemáticas.
              </p>

            </div>

            {/* CARD 3 */}
            <div className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition group-hover:bg-[#0F172A] group-hover:text-white">
                <FileBarChart className="h-7 w-7" />
              </div>

              <h3 className="mt-6 text-xl font-bold text-[#0F172A]">
                Información accionable
              </h3>

              <p className="mt-3 leading-7 text-[#64748B]">
                Consulta indicadores y reportes para comprender el
                comportamiento de la operación empresarial.
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          MÓDULOS
      ========================================================= */}
      <section
        id="modulos"
        className="scroll-mt-20 bg-white py-24 lg:py-28"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

            <div className="max-w-2xl">

              <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
                Módulos
              </span>

              <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
                Todo conectado en un solo sistema
              </h2>

              <p className="mt-4 text-lg leading-8 text-[#64748B]">
                MatrixFlow organiza las principales áreas de información
                empresarial en módulos independientes pero conectados.
              </p>

            </div>

            <div className="hidden h-px flex-1 bg-slate-200 lg:ml-12 lg:block" />

          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {/* SUCURSALES */}
            <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6 transition hover:border-blue-200 hover:bg-blue-50/40">

              <Building2 className="h-7 w-7 text-blue-600" />

              <h3 className="mt-5 font-bold text-[#0F172A]">
                Sucursales
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                Administra las diferentes ubicaciones de la empresa.
              </p>

            </div>

            {/* PRODUCTOS */}
            <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6 transition hover:border-blue-200 hover:bg-blue-50/40">

              <Layers3 className="h-7 w-7 text-blue-600" />

              <h3 className="mt-5 font-bold text-[#0F172A]">
                Productos
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                Gestiona el catálogo y la información de productos.
              </p>

            </div>

            {/* VENTAS */}
            <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6 transition hover:border-blue-200 hover:bg-blue-50/40">

              <ShoppingCart className="h-7 w-7 text-blue-600" />

              <h3 className="mt-5 font-bold text-[#0F172A]">
                Ventas
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                Registra y consulta las operaciones comerciales.
              </p>

            </div>

            {/* INVENTARIO */}
            <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6 transition hover:border-blue-200 hover:bg-blue-50/40">

              <Warehouse className="h-7 w-7 text-blue-600" />

              <h3 className="mt-5 font-bold text-[#0F172A]">
                Inventario
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                Controla existencias y movimientos de productos.
              </p>

            </div>

            {/* METAS */}
            <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6 transition hover:border-blue-200 hover:bg-blue-50/40">

              <Target className="h-7 w-7 text-blue-600" />

              <h3 className="mt-5 font-bold text-[#0F172A]">
                Metas
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                Define objetivos para el seguimiento empresarial.
              </p>

            </div>

            {/* INDICADORES */}
            <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6 transition hover:border-blue-200 hover:bg-blue-50/40">

              <BarChart3 className="h-7 w-7 text-blue-600" />

              <h3 className="mt-5 font-bold text-[#0F172A]">
                Indicadores
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                Visualiza métricas para analizar el desempeño.
              </p>

            </div>

            {/* REPORTES */}
            <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6 transition hover:border-blue-200 hover:bg-blue-50/40">

              <FileBarChart className="h-7 w-7 text-blue-600" />

              <h3 className="mt-5 font-bold text-[#0F172A]">
                Reportes
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                Obtén información consolidada de la operación.
              </p>

            </div>

            {/* HISTORIAL */}
            <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6 transition hover:border-blue-200 hover:bg-blue-50/40">

              <Database className="h-7 w-7 text-blue-600" />

              <h3 className="mt-5 font-bold text-[#0F172A]">
                Historial
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                Conserva el seguimiento de las operaciones realizadas.
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          ANÁLISIS MATEMÁTICO
      ========================================================= */}
      <section
        id="analisis"
        className="relative scroll-mt-20 overflow-hidden bg-[#0F172A] py-24 lg:py-28"
      >
        <div className="absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute -left-40 bottom-0 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">

          <div className="grid items-center gap-16 lg:grid-cols-2">

            {/* TEXTO */}
            <div>

              <span className="inline-flex items-center rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-300">
                Análisis matemático
              </span>

              <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                De la información empresarial
                <span className="block text-blue-400">
                  a los modelos matemáticos.
                </span>
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-300">
                MatrixFlow permite transformar registros empresariales
                en estructuras matemáticas para realizar operaciones y
                análisis sobre la información.
              </p>

              <div className="mt-8 space-y-4">

                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      Vectores
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      Representación estructurada de datos empresariales.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      Matrices
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      Organización de información en estructuras
                      multidimensionales.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      Operaciones
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      Procesamiento matemático para obtener resultados
                      sobre los datos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      Combinaciones lineales
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      Relación matemática entre diferentes registros.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* VISUAL MATEMÁTICO */}
            <div className="relative">

              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl">

                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">
                      Modelo de datos
                    </p>

                    <p className="mt-1 font-semibold text-white">
                      Vector empresarial
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Network className="h-5 w-5" />
                  </div>
                </div>

                {/* VECTOR */}
                <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">

                  <p className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                    V = [ ventas, inventario, metas, indicadores ]
                  </p>

                  <div className="grid grid-cols-4 gap-3">

                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-center">
                      <p className="text-xs text-blue-300">
                        Ventas
                      </p>

                      <p className="mt-2 text-xl font-bold text-white">
                        120
                      </p>
                    </div>

                    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-center">
                      <p className="text-xs text-cyan-300">
                        Stock
                      </p>

                      <p className="mt-2 text-xl font-bold text-white">
                        85
                      </p>
                    </div>

                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-center">
                      <p className="text-xs text-blue-300">
                        Metas
                      </p>

                      <p className="mt-2 text-xl font-bold text-white">
                        92
                      </p>
                    </div>

                    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-center">
                      <p className="text-xs text-cyan-300">
                        KPI
                      </p>

                      <p className="mt-2 text-xl font-bold text-white">
                        76
                      </p>
                    </div>

                  </div>

                </div>

                {/* OPERACIONES */}
                <div className="mt-4 grid grid-cols-2 gap-4">

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs text-slate-500">
                      Operación
                    </p>

                    <p className="mt-2 font-mono text-sm text-blue-300">
                      V₁ + V₂
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs text-slate-500">
                      Resultado
                    </p>

                    <p className="mt-2 font-mono text-sm text-cyan-300">
                      [240, 170, ...]
                    </p>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          ARQUITECTURA
      ========================================================= */}
      <section
        id="arquitectura"
        className="scroll-mt-20 bg-[#F8FAFC] py-24 lg:py-28"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="mx-auto max-w-3xl text-center">

            <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
              Arquitectura
            </span>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl lg:text-5xl">
              Una arquitectura preparada para crecer
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#64748B]">
              Frontend, API, procesamiento matemático y base de datos
              trabajando como una solución empresarial integrada.
            </p>

          </div>

          {/* ARQUITECTURA VISUAL */}
          <div className="mt-16 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-10">

            <div className="grid gap-5 md:grid-cols-5">

              {/* REACT */}
              <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Layers3 className="h-7 w-7" />
                </div>

                <h3 className="mt-4 font-bold text-[#0F172A]">
                  React
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#64748B]">
                  Interfaz empresarial
                </p>

              </div>

              <div className="hidden items-center justify-center md:flex">
                <ArrowRight className="h-5 w-5 text-slate-300" />
              </div>

              {/* FASTAPI */}
              <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                  <Network className="h-7 w-7" />
                </div>

                <h3 className="mt-4 font-bold text-[#0F172A]">
                  FastAPI
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#64748B]">
                  API y servicios
                </p>

              </div>

              <div className="hidden items-center justify-center md:flex">
                <ArrowRight className="h-5 w-5 text-slate-300" />
              </div>

              {/* POSTGRESQL */}
              <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Database className="h-7 w-7" />
                </div>

                <h3 className="mt-4 font-bold text-[#0F172A]">
                  PostgreSQL
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#64748B]">
                  Datos empresariales
                </p>

              </div>

            </div>

            {/* NUMPY / SEGURIDAD */}
            <div className="mt-5 grid gap-5 md:grid-cols-2">

              <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <BrainCircuit className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="font-bold text-[#0F172A]">
                      NumPy
                    </h3>

                    <p className="mt-1 text-sm text-[#64748B]">
                      Procesamiento de vectores, matrices y operaciones.
                    </p>
                  </div>

                </div>

              </div>

              <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <ShieldCheck className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="font-bold text-[#0F172A]">
                      Seguridad y roles
                    </h3>

                    <p className="mt-1 text-sm text-[#64748B]">
                      Control de acceso para Administrador, Analista y Consulta.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#0F172A] py-24">

        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-400">
            <LockKeyhole className="h-7 w-7" />
          </div>

          <h2 className="mt-7 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Centraliza tu información empresarial.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
            Accede a MatrixFlow Enterprise y gestiona tus datos desde
            una plataforma diseñada para análisis y control empresarial.
          </p>

          <button
            onClick={goToLogin}
            className="group mt-9 inline-flex items-center gap-3 rounded-xl bg-[#2563EB] px-7 py-4 font-semibold text-white shadow-xl shadow-blue-950/30 transition hover:bg-blue-500"
          >
            Ingresar a MatrixFlow
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>

        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-white/5 bg-[#0B1120]">

        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">

            {/* LOGO */}
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <img
                  src="/logo-matrixflow.png"
                  alt="MatrixFlow"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <p className="font-bold text-white">
                  MatrixFlow Enterprise
                </p>

                <p className="text-xs text-slate-500">
                  Plataforma empresarial de análisis
                </p>
              </div>

            </div>

            {/* SEGURIDAD */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <ShieldCheck className="h-4 w-4" />
              Gestión empresarial de información
            </div>

          </div>

          <div className="mt-10 border-t border-white/5 pt-6">

            <div className="flex flex-col justify-between gap-3 text-xs text-slate-600 sm:flex-row">

              <p>
                © 2026 MatrixFlow Enterprise. Todos los derechos reservados.
              </p>

              <p>
                React · FastAPI · PostgreSQL · NumPy
              </p>

            </div>

          </div>

        </div>
      </footer>

    </main>
  )
}