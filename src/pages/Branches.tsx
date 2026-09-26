import { useEffect, useState } from 'react'
import {
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import PageHeader from '../components/common/PageHeader'
import Modal from '../components/common/Modal'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

interface BranchItem {
  id: number
  name: string
  location?: string | null
  company_id: number
}

interface CompanyItem {
  id: number
  name: string
}

const branchSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres.'),
  location: z
    .string()
    .min(2, 'La ubicación o ciudad es requerida.'),
  company_id: z.coerce
    .number()
    .int()
    .positive('Selecciona una empresa válida.'),
})

/*
 * z.input = datos que entran al formulario.
 * z.output = datos después de que Zod realiza la conversión.
 *
 * company_id entra desde el <select> como string,
 * pero z.coerce.number() lo convierte a number.
 */
type BranchFormInput = z.input<typeof branchSchema>
type BranchFormData = z.output<typeof branchSchema>

export default function Branches() {
  const { hasRole } = useAuth()
  const canEdit = hasRole(['Administrador'])

  const [branches, setBranches] = useState<BranchItem[]>([])
  const [companies, setCompanies] = useState<CompanyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchFormInput, any, BranchFormData>({
    resolver: zodResolver(branchSchema),
  })

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [branchesRes, companiesRes] = await Promise.all([
        api.get<BranchItem[]>('/api/v1/branches/'),
        api.get<CompanyItem[]>('/api/v1/companies/'),
      ])

      setBranches(branchesRes.data)
      setCompanies(companiesRes.data)
    } catch (err: any) {
      console.error('Error al cargar sucursales:', err)

      setError(
        err.response?.data?.detail ||
          'No se pudieron obtener las sucursales de la base de datos.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreateModal = () => {
    setEditingBranch(null)

    reset({
      name: '',
      location: '',
      company_id: companies[0]?.id || 1,
    })

    setIsModalOpen(true)
  }

  const openEditModal = (branch: BranchItem) => {
    setEditingBranch(branch)

    reset({
      name: branch.name,
      location: branch.location || '',
      company_id: branch.company_id,
    })

    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBranch(null)
    reset()
  }

  const onSubmit = async (data: BranchFormData) => {
    try {
      setSaving(true)
      setError('')

      if (editingBranch) {
        await api.put(`/api/v1/branches/${editingBranch.id}`, {
          name: data.name,
          location: data.location,
          company_id: data.company_id,
        })

        setSuccessMessage(
          'Sucursal actualizada exitosamente en base de datos.'
        )
      } else {
        await api.post('/api/v1/branches/', {
          name: data.name,
          location: data.location,
          company_id: data.company_id,
        })

        setSuccessMessage(
          'Sucursal creada y guardada .'
        )
      }

      closeModal()
      loadData()

      setTimeout(() => setSuccessMessage(''), 3500)
    } catch (err: any) {
      console.error('Error al persistir sucursal:', err)

      setError(
        err.response?.data?.detail ||
          'Error al guardar la sucursal en la base de datos.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (
      !window.confirm(
        `¿Seguro que deseas eliminar la sucursal "${name}" de la base de datos?`
      )
    ) {
      return
    }

    try {
      setLoading(true)

      await api.delete(`/api/v1/branches/${id}`)

      setSuccessMessage(
        `Sucursal "${name}" eliminada de la base de datos.`
      )

      loadData()

      setTimeout(() => setSuccessMessage(''), 3500)
    } catch (err: any) {
      console.error('Error al eliminar sucursal:', err)

      setError(
        err.response?.data?.detail ||
          'No se pudo eliminar la sucursal. Puede tener registros dependientes (ventas o inventario).'
      )

      setLoading(false)
    }
  }

  const getCompanyName = (companyId: number) => {
    const comp = companies.find((c) => c.id === companyId)

    return comp ? comp.name : `Empresa #${companyId}`
  }

  if (loading && branches.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={36}
            className="animate-spin text-[#2563EB] mx-auto mb-3"
          />

          <p className="text-sm font-medium text-[#64748B]">
            Consultando sedes desde Supabase...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sucursales"
        description="Administra las sedes físicas y operativas."
        action={
          <div className="flex gap-2">
            <button
              onClick={loadData}
              title="Refrescar datos"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#0F172A] shadow-sm hover:bg-slate-50 transition"
            >
              <RefreshCw size={16} />
              Refrescar
            </button>

            {canEdit && (
              <button
                onClick={openCreateModal}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <Plus size={18} />
                Nueva sucursal
              </button>
            )}
          </div>
        }
      />

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-medium text-emerald-800 animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-600" />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Error operativo:</p>

          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* Tarjetas informativas de KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Total Sucursales
          </p>

          <p className="mt-2 text-2xl font-bold text-[#0F172A]">
            {branches.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Empresas Asociadas
          </p>

          <p className="mt-2 text-2xl font-bold text-[#2563EB]">
            {new Set(branches.map((b) => b.company_id)).size}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Estado de Conexión
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />

            <p className="text-sm font-bold text-emerald-600">
              Supabase PostgreSQL Activo
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de Sucursales */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h3 className="font-bold text-[#0F172A]">
            Listado de Sedes Operativas
          </h3>

          <p className="text-xs text-[#64748B] mt-0.5">
            Sedes registradas
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  ID
                </th>

                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Sucursal
                </th>

                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Ubicación / Ciudad
                </th>

                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Empresa Vinculada
                </th>

                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {branches.map((branch) => (
                <tr
                  key={branch.id}
                  className="transition hover:bg-slate-50/80"
                >
                  <td className="px-5 py-4 font-mono text-xs font-bold text-[#64748B]">
                    #{branch.id}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-50 p-2 text-[#2563EB]">
                        <Building2 size={18} />
                      </div>

                      <span className="font-semibold text-[#0F172A]">
                        {branch.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-[#0F172A]">
                      <MapPin
                        size={15}
                        className="text-[#06B6D4]"
                      />

                      <span>
                        {branch.location || 'No especificada'}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-[#64748B]">
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {getCompanyName(branch.company_id)}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    {canEdit && (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEditModal(branch)}
                          className="rounded-lg p-2 text-[#64748B] hover:bg-blue-50 hover:text-[#2563EB] transition"
                          title="Editar sucursal"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(branch.id, branch.name)
                          }
                          className="rounded-lg p-2 text-[#64748B] hover:bg-red-50 hover:text-red-600 transition"
                          title="Eliminar sucursal"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {branches.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-[#64748B]"
                  >
                    No hay sucursales registradas en la base de datos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBranch ? 'Editar sucursal' : 'Nueva sucursal'}
        description="Completa la información de la sede para guardarla."
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            label="Nombre de la sucursal"
            error={errors.name?.message}
          >
            <input
              {...register('name')}
              placeholder="Ej. Sede Lima Norte"
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Ubicación o Ciudad"
            error={errors.location?.message}
          >
            <input
              {...register('location')}
              placeholder="Ej. Lima, Av. Industrial 450"
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Empresa vinculada"
            error={errors.company_id?.message}
          >
            <select
              {...register('company_id')}
              className={inputClass}
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (ID: #{c.id})
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#64748B] hover:bg-slate-50 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {editingBranch
                ? 'Guardar cambios'
                : 'Crear en BD'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

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
      <label className="mb-2 block text-sm font-medium text-[#0F172A]">
        {label}
      </label>

      {children}

      {error && (
        <p className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}

