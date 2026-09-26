import { useEffect, useState } from 'react'
import {
  Boxes,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import PageHeader from '../components/common/PageHeader'
import Modal from '../components/common/Modal'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

interface ProductItem {
  id: number
  name: string
  description?: string | null
  price: number
  category_id?: number | null
}

const productSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres.'),
  description: z
    .string()
    .optional(),
  price: z.coerce
    .number()
    .positive('El precio debe ser mayor que 0.'),
})

type ProductFormData = z.input<typeof productSchema>

export default function Products() {
  const { hasRole } = useAuth()
  const canEdit = hasRole(['Administrador'])

  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  })

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get<ProductItem[]>('/api/v1/products/')
      setProducts(response.data)
    } catch (err: any) {
      console.error('Error al cargar productos:', err)
      setError(err.response?.data?.detail || 'No se pudieron obtener los productos de la base de datos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      `${product.name} ${product.description ?? ''} PRD-${product.id}`
        .toLowerCase()
        .includes(search.toLowerCase())
  )

  const openCreateModal = () => {
    setEditingProduct(null)
    reset({
      name: '',
      description: '',
      price: 0,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (product: ProductItem) => {
    setEditingProduct(product)
    reset({
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    reset()
  }

  const onSubmit = async (data: ProductFormData) => {
    try {
      setSaving(true)
      setError('')

      if (editingProduct) {
        await api.put(`/api/v1/products/${editingProduct.id}`, {
          name: data.name,
          description: data.description || null,
          price: data.price,
          category_id: null,
        })
        setSuccessMessage('Producto actualizado exitosamente.')
      } else {
        await api.post('/api/v1/products/', {
          name: data.name,
          description: data.description || null,
          price: data.price,
          category_id: null,
        })
        setSuccessMessage('Nuevo producto registrado y guardado en base de datos.')
      }

      closeModal()
      loadProducts()
      setTimeout(() => setSuccessMessage(''), 3500)
    } catch (err: any) {
      console.error('Error al guardar producto:', err)
      setError(err.response?.data?.detail || 'Error al persistir el producto en la base de datos.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`¿Deseas eliminar el producto "${name}" de la base de datos?`)) {
      return
    }

    try {
      setLoading(true)
      await api.delete(`/api/v1/products/${id}`)
      setSuccessMessage(`Producto "${name}" eliminado de la base de datos.`)
      loadProducts()
      setTimeout(() => setSuccessMessage(''), 3500)
    } catch (err: any) {
      console.error('Error al eliminar producto:', err)
      setError(err.response?.data?.detail || 'No se pudo eliminar el producto. Puede tener ventas asociadas.')
      setLoading(false)
    }
  }

  const averagePrice = products.length > 0
    ? products.reduce((sum, p) => sum + Number(p.price || 0), 0) / products.length
    : 0

  if (loading && products.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 size={36} className="animate-spin text-[#2563EB] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#64748B]">Cargando catálogo de productos desde Supabase...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Gestiona el catálogo de productos y artículos comerciales."
        action={
          <div className="flex gap-2">
            <button
              onClick={loadProducts}
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
                Nuevo producto
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

      {/* Tarjetas KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Total Productos en BD
          </p>
          <p className="mt-2 text-2xl font-bold text-[#0F172A]">
            {products.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Precio Promedio
          </p>
          <p className="mt-2 text-2xl font-bold text-[#2563EB]">
            S/ {averagePrice.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Almacenamiento
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-sm font-bold text-emerald-600">
              Persistencia Supabase Activa
            </p>
          </div>
        </div>
      </div>

      {/* Tabla Catálogo */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-[#0F172A]">
              Catálogo de Productos
            </h3>
            <p className="text-xs text-[#64748B]">
              Artículos disponibles para facturación y control de inventario
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto por nombre..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-[#0F172A]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Código
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Producto
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Descripción
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Precio Unitario
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="transition hover:bg-slate-50/80">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-[#06B6D4]">
                    PRD-{String(product.id).padStart(3, '0')}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-cyan-50 p-2 text-[#06B6D4]">
                        <Boxes size={18} />
                      </div>
                      <span className="font-semibold text-[#0F172A]">{product.name}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-[#64748B] max-w-[300px] truncate">
                    {product.description || 'Sin descripción'}
                  </td>

                  <td className="px-5 py-4 text-right font-mono font-bold text-[#0F172A]">
                    S/ {Number(product.price).toFixed(2)}
                  </td>

                  <td className="px-5 py-4 text-right">
                    {canEdit && (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEditModal(product)}
                          className="rounded-lg p-2 text-[#64748B] hover:bg-blue-50 hover:text-[#2563EB] transition"
                          title="Editar producto"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="rounded-lg p-2 text-[#64748B] hover:bg-red-50 hover:text-red-600 transition"
                          title="Eliminar producto"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[#64748B]">
                    No se encontraron productos registrados en la base de datos.
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
        title={editingProduct ? 'Editar producto' : 'Nuevo producto'}
        description="Completa los datos del artículo para guardarlo ."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Nombre del producto" error={errors.name?.message}>
            <input
              {...register('name')}
              placeholder="Ej. Servidor Blade Xeon 64GB"
              className={inputClass}
            />
          </FormField>

          <FormField label="Descripción" error={errors.description?.message}>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Especificaciones o detalles del producto..."
              className={inputClass}
            />
          </FormField>

          <FormField label="Precio (PEN)" error={errors.price?.message}>
            <input
              type="number"
              step="0.01"
              min="0.01"
              {...register('price')}
              className={inputClass}
            />
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
              {saving && <Loader2 size={16} className="animate-spin" />}
              {editingProduct ? 'Guardar cambios' : 'Crear en BD'}
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