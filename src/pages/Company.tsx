
import { useEffect, useState } from 'react'
import {
  Activity,
  Building2,
  CheckCircle2,
  Database,
  Edit3,
  FileText,
  Layers3,
  Loader2,
  Plus,
  RefreshCw,
  Server,
  ShieldCheck,
  Store,
  Boxes,
  BarChart3,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import PageHeader from '../components/common/PageHeader'
import Modal from '../components/common/Modal'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

interface CompanyData {
  id: number
  name: string
  description?: string | null
}

const companySchema = z.object({
  name: z
    .string()
    .min(3, 'La razón social debe tener al menos 3 caracteres.')
    .max(150, 'La razón social no puede superar los 150 caracteres.'),
  description: z
    .string()
    .max(500, 'La descripción no puede superar los 500 caracteres.')
    .optional(),
})

type CompanyFormData = z.infer<typeof companySchema>

export default function Company() {
  const { hasRole } = useAuth()

  const canEdit = hasRole(['Administrador'])

  const [companies, setCompanies] = useState<CompanyData[]>([])
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyData | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get<CompanyData[]>(
        '/api/v1/companies/'
      )

      const data = Array.isArray(response.data)
        ? response.data
        : []

      setCompanies(data)

      if (data.length > 0) {
        setSelectedCompany((current) => {
          if (!current) {
            return data[0]
          }

          return (
            data.find((company) => company.id === current.id) ||
            data[0]
          )
        })
      } else {
        setSelectedCompany(null)
      }
    } catch (err: any) {
      console.error(
        'Error al obtener empresas:',
        err
      )

      setError(
        err.response?.data?.detail ||
          'No se pudo obtener la información corporativa desde la API de MatrixFlow.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const openCreateModal = () => {
    setIsCreating(true)

    reset({
      name: '',
      description: '',
    })

    setIsModalOpen(true)
  }

  const openEditModal = (
    company: CompanyData
  ) => {
    setIsCreating(false)

    reset({
      name: company.name,
      description: company.description || '',
    })

    setIsModalOpen(true)
  }

  const onSubmit = async (
    data: CompanyFormData
  ) => {
    try {
      setSaving(true)
      setError('')
      setSuccessMessage('')

      if (isCreating || !selectedCompany) {
        const response =
          await api.post<CompanyData>(
            '/api/v1/companies/',
            {
              name: data.name.trim(),
              description:
                data.description?.trim() || null,
            }
          )

        setSuccessMessage(
          'Empresa registrada correctamente en MatrixFlow Enterprise.'
        )

        setSelectedCompany(
          response.data
        )
      } else {
        const response =
          await api.put<CompanyData>(
            `/api/v1/companies/${selectedCompany.id}`,
            {
              name: data.name.trim(),
              description:
                data.description?.trim() || null,
            }
          )

        setSuccessMessage(
          'Información corporativa actualizada correctamente.'
        )

        setSelectedCompany(
          response.data
        )
      }

      setIsModalOpen(false)

      await fetchCompanies()

      window.setTimeout(() => {
        setSuccessMessage('')
      }, 3500)
    } catch (err: any) {
      console.error(
        'Error al guardar empresa:',
        err
      )

      setError(
        err.response?.data?.detail ||
          'No fue posible guardar la información de la empresa.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <Loader2
              size={25}
              className="animate-spin text-[#2563EB]"
            />
          </div>

          <p className="text-sm font-semibold text-[#0F172A]">
            Cargando información corporativa
          </p>

          <p className="mt-1 text-xs text-[#64748B]">
            MatrixFlow Enterprise
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ENCABEZADO */}
      <PageHeader
        title="Empresa"
        description="Entidad corporativa principal de MatrixFlow Enterprise y punto de referencia para la gestión del negocio."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={fetchCompanies}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Actualizar
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={
                  selectedCompany
                    ? () =>
                        openEditModal(
                          selectedCompany
                        )
                    : openCreateModal
                }
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                {selectedCompany ? (
                  <>
                    <Edit3 size={16} />
                    Editar información
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Registrar empresa
                  </>
                )}
              </button>
            )}
          </div>
        }
      />

      {/* MENSAJE DE ÉXITO */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-800">
          <CheckCircle2
            size={18}
            className="shrink-0 text-emerald-600"
          />

          <span>{successMessage}</span>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
          <div className="flex items-start gap-3">
            <Activity
              size={18}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="font-semibold">
                No se pudo completar la operación
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedCompany ? (
        <>
          {/* RESUMEN CORPORATIVO */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            <MetricCard
              icon={Building2}
              label="Entidad corporativa"
              value="1"
              detail="Empresa principal"
            />

            <MetricCard
              icon={Store}
              label="Empresas registradas"
              value={String(companies.length)}
              detail="Entidades disponibles"
            />

            <MetricCard
              icon={Database}
              label="Persistencia"
              value="PostgreSQL"
              detail="Datos empresariales"
            />

            <MetricCard
              icon={ShieldCheck}
              label="Estado"
              value="Activo"
              detail="Entidad operativa"
              positive
            />

          </section>

          {/* INFORMACIÓN PRINCIPAL */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">

            {/* FICHA EMPRESARIAL */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F172A] text-white shadow-sm">
                      <Building2 size={23} />
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                        Entidad empresarial
                      </p>

                      <h2 className="mt-1 text-xl font-bold tracking-tight text-[#0F172A]">
                        {selectedCompany.name}
                      </h2>
                    </div>

                  </div>

                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Operativa
                  </span>

                </div>
              </div>

              <div className="p-6">

                <div className="grid gap-6 sm:grid-cols-2">

                  <InfoItem
                    label="Razón social"
                    value={selectedCompany.name}
                  />

                  <InfoItem
                    label="Identificador empresarial"
                    value={`ENT-${String(
                      selectedCompany.id
                    ).padStart(4, '0')}`}
                  />

                  <InfoItem
                    label="Registro interno"
                    value={`#${selectedCompany.id}`}
                  />

                  <InfoItem
                    label="Módulo"
                    value="Gestión empresarial"
                  />

                </div>

                <div className="mt-7 border-t border-slate-100 pt-6">

                  <div className="mb-2 flex items-center gap-2">
                    <FileText
                      size={16}
                      className="text-[#2563EB]"
                    />

                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#64748B]">
                      Descripción corporativa
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-4">
                    <p className="text-sm leading-6 text-[#0F172A]">
                      {selectedCompany.description ||
                        'No se ha registrado una descripción corporativa para esta entidad.'}
                    </p>
                  </div>

                </div>

              </div>
            </section>

            {/* CONTEXTO MATRIXFLOW */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                  Estructura empresarial
                </p>

                <h3 className="mt-1 text-base font-bold text-[#0F172A]">
                  Organización del negocio
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-[#64748B]">
                  La empresa constituye la entidad principal sobre la que MatrixFlow organiza la información operativa y analítica.
                </p>
              </div>

              <div className="p-5">

                <div className="space-y-3">

                  <ModuleRelation
                    icon={Store}
                    title="Sucursales"
                    description="Sedes y datos operativos"
                  />

                  <ModuleRelation
                    icon={Boxes}
                    title="Productos"
                    description="Catálogo y categorías"
                  />

                  <ModuleRelation
                    icon={BarChart3}
                    title="Ventas"
                    description="Cantidades e importes"
                  />

                  <ModuleRelation
                    icon={Layers3}
                    title="Inventario"
                    description="Existencias y movimientos"
                  />

                </div>

              </div>
            </section>

          </div>

          {/* CAPA DE DATOS Y ANÁLISIS */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-5">

              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                  Arquitectura empresarial
                </p>

                <h3 className="text-base font-bold text-[#0F172A]">
                  Empresa como fuente de información
                </h3>

                <p className="max-w-3xl text-sm leading-6 text-[#64748B]">
                  La información registrada en MatrixFlow alimenta posteriormente los módulos de análisis mediante vectores, matrices, operaciones e indicadores empresariales.
                </p>
              </div>

            </div>

            <div className="grid gap-0 divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">

              <ArchitectureItem
                icon={Building2}
                title="Gestión empresarial"
                description="Identidad y configuración de la organización."
              />

              <ArchitectureItem
                icon={Database}
                title="Datos persistidos"
                description="Información almacenada mediante la API y PostgreSQL."
              />

              <ArchitectureItem
                icon={Server}
                title="Análisis MatrixFlow"
                description="Los datos empresariales sirven como base para vectores, matrices e indicadores."
              />

            </div>

          </section>

          {/* EMPRESAS REGISTRADAS */}
          {companies.length > 1 && (
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                    Registro empresarial
                  </p>

                  <h3 className="mt-1 text-base font-bold text-[#0F172A]">
                    Empresas disponibles
                  </h3>
                </div>

                {canEdit && (
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#2563EB] transition hover:bg-blue-50"
                  >
                    <Plus size={15} />
                    Nueva empresa
                  </button>
                )}

              </div>

              <div className="divide-y divide-slate-100">

                {companies.map((company) => (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() =>
                      setSelectedCompany(company)
                    }
                    className={`flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition ${
                      selectedCompany.id === company.id
                        ? 'bg-blue-50/60'
                        : 'hover:bg-slate-50'
                    }`}
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          selectedCompany.id === company.id
                            ? 'bg-[#2563EB] text-white'
                            : 'bg-slate-100 text-[#64748B]'
                        }`}
                      >
                        <Building2 size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#0F172A]">
                          {company.name}
                        </p>

                        <p className="mt-0.5 text-[11px] text-[#64748B]">
                          ENT-
                          {String(company.id).padStart(
                            4,
                            '0'
                          )}
                        </p>
                      </div>

                    </div>

                    {selectedCompany.id === company.id && (
                      <span className="shrink-0 text-xs font-bold text-[#2563EB]">
                        Seleccionada
                      </span>
                    )}

                  </button>
                ))}

              </div>

            </section>
          )}

        </>
      ) : (
        /* ESTADO SIN EMPRESA */
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-[#64748B]">
            <Building2 size={27} />
          </div>

          <h3 className="mt-5 text-lg font-bold text-[#0F172A]">
            No existe una empresa registrada
          </h3>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#64748B]">
            Registra la entidad empresarial principal para comenzar a organizar sucursales, productos, ventas e inventario dentro de MatrixFlow Enterprise.
          </p>

          {canEdit && (
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={17} />
              Registrar empresa
            </button>
          )}

        </section>
      )}

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          isCreating
            ? 'Registrar empresa'
            : 'Editar información empresarial'
        }
        description={
          isCreating
            ? 'Registra la entidad corporativa principal de MatrixFlow Enterprise.'
            : 'Actualiza la información corporativa almacenada en la plataforma.'
        }
      >

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >

          <FormField
            label="Razón social"
            error={errors.name?.message}
          >
            <input
              {...register('name')}
              placeholder="Nombre de la empresa"
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Descripción corporativa"
            error={
              errors.description?.message
            }
          >
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Describe brevemente la actividad o propósito de la empresa..."
              className={`${inputClass} resize-none`}
            />
          </FormField>

          <div className="rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-3">
            <div className="flex items-start gap-2.5">

              <Database
                size={16}
                className="mt-0.5 shrink-0 text-[#2563EB]"
              />

              <p className="text-xs leading-5 text-slate-600">
                La información será enviada mediante la API de MatrixFlow y persistida en PostgreSQL.
              </p>

            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

            <button
              type="button"
              onClick={() =>
                setIsModalOpen(false)
              }
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#64748B] transition hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {isCreating
                ? 'Registrar empresa'
                : 'Guardar cambios'}
            </button>

          </div>

        </form>

      </Modal>

    </div>
  )
}

/* =========================================================
   COMPONENTES AUXILIARES
========================================================= */

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  positive = false,
}: {
  icon: typeof Building2
  label: string
  value: string
  detail: string
  positive?: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between gap-3">

        <div>
          <p className="text-xs font-semibold text-[#64748B]">
            {label}
          </p>

          <p className="mt-2 text-xl font-bold tracking-tight text-[#0F172A]">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-[#64748B]">
            {detail}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            positive
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-blue-50 text-[#2563EB]'
          }`}
        >
          <Icon size={18} />
        </div>

      </div>

    </div>
  )
}

function InfoItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-bold text-[#0F172A]">
        {value}
      </p>
    </div>
  )
}

function ModuleRelation({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Store
  title: string
  description: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-[#F8FAFC] px-3.5 py-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#2563EB] shadow-sm">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold text-[#0F172A]">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] text-[#64748B]">
          {description}
        </p>
      </div>

    </div>
  )
}

function ArchitectureItem({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Building2
  title: string
  description: string
}) {
  return (
    <div className="p-6">

      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
        <Icon size={19} />
      </div>

      <h4 className="mt-4 text-sm font-bold text-[#0F172A]">
        {title}
      </h4>

      <p className="mt-1.5 text-xs leading-5 text-[#64748B]">
        {description}
      </p>

    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100'

function FormField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-[#0F172A]">
        {label}
      </label>

      {children}

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">
          {error}
        </p>
      )}

    </div>
  )
}

