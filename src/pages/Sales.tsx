import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  X,
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
}

interface ProductItem {
  id: number
  name: string
  price: number
}

interface SaleDetailItem {
  id?: number
  product_id: number
  product_name?: string
  quantity: number
  unit_price: number
}

interface SaleItem {
  id: number
  branch_id: number
  branch_name?: string
  total: number
  details?: SaleDetailItem[]
}

const saleSchema = z.object({
  branch_id: z.coerce
    .number()
    .int()
    .positive('Selecciona una sucursal.'),
  product_id: z.coerce
    .number()
    .int()
    .positive('Selecciona un producto.'),
  quantity: z.coerce
    .number()
    .positive('La cantidad debe ser mayor que 0.'),
  unit_price: z.coerce
    .number()
    .positive('El precio unitario debe ser mayor que 0.'),
})

type SaleFormInput = z.input<typeof saleSchema>
type SaleFormData = z.output<typeof saleSchema>

export default function Sales() {
  const { hasRole } = useAuth()
  const canEdit = hasRole(['Administrador', 'Analista'])

  const [sales, setSales] = useState<SaleItem[]>([])
  const [branches, setBranches] = useState<BranchItem[]>([])
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [search, setSearch] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<SaleItem | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SaleFormInput, any, SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      quantity: 1,
      unit_price: 0,
    },
  })

  const watchedQuantity = watch('quantity') || 0
  const watchedUnitPrice = watch('unit_price') || 0
  const calculatedSubtotal =
    Number(watchedQuantity) * Number(watchedUnitPrice)

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [salesRes, branchesRes, productsRes] = await Promise.all([
        api.get<SaleItem[]>('/api/v1/sales/'),
        api.get<BranchItem[]>('/api/v1/branches/'),
        api.get<ProductItem[]>('/api/v1/products/'),
      ])

      setSales(salesRes.data)
      setBranches(branchesRes.data)
      setProducts(productsRes.data)
    } catch (err: any) {
      console.error('Error cargando ventas:', err)
      setError(
        err.response?.data?.detail ||
          'No se pudieron sincronizar las ventas con la base de datos.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleProductChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const pId = Number(e.target.value)

    setValue('product_id', pId)

    const product = products.find((p) => p.id === pId)

    if (product) {
      setValue('unit_price', Number(product.price))
    } else {
      setValue('unit_price', 0)
    }
  }

  const openCreateModal = () => {
    reset({
      branch_id: branches[0]?.id || 1,
      product_id: products[0]?.id || 1,
      quantity: 1,
      unit_price: products[0]?.price || 0,
    })

    setIsModalOpen(true)
  }

  const onSubmit = async (data: SaleFormData) => {
    try {
      setSaving(true)
      setError('')

      await api.post('/api/v1/sales/', {
        branch_id: Number(data.branch_id),
        details: [
          {
            product_id: Number(data.product_id),
            quantity: Number(data.quantity),
            unit_price: Number(data.unit_price),
          },
        ],
      })

      setSuccessMessage(
        'Venta registrada con éxito y guardada .'
      )

      setIsModalOpen(false)

      loadData()

      setTimeout(() => setSuccessMessage(''), 3500)
    } catch (err: any) {
      console.error('Error al registrar venta:', err)

      setError(
        err.response?.data?.detail ||
          'Error al persistir la transacción en la base de datos.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        `¿Deseas eliminar la venta #${id} de la base de datos?`
      )
    ) {
      return
    }

    try {
      setLoading(true)

      await api.delete(`/api/v1/sales/${id}`)

      setSuccessMessage(
        `Venta #${id} eliminada de la base de datos.`
      )

      loadData()

      setTimeout(() => setSuccessMessage(''), 3500)
    } catch (err: any) {
      console.error('Error al eliminar venta:', err)

      setError(
        err.response?.data?.detail ||
          'No se pudo eliminar la venta.'
      )

      setLoading(false)
    }
  }

  const totalSalesRevenue = sales.reduce(
    (sum, s) => sum + Number(s.total || 0),
    0
  )

  const filteredSales = sales.filter((sale) => {
    const text = `V-${sale.id} ${
      sale.branch_name ?? ''
    } ${sale.total}`.toLowerCase()

    return text.includes(search.toLowerCase())
  })

  if (loading && sales.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={36}
            className="animate-spin text-[#2563EB] mx-auto mb-3"
          />

          <p className="text-sm font-medium text-[#64748B]">
            Obteniendo transacciones comerciales ...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ventas"
        description="Registro y facturación de operaciones comerciales ."
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
                Nueva venta
              </button>
            )}
          </div>
        }
      />

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-medium text-emerald-800 animate-fade-in">
          <CheckCircle2
            size={18}
            className="text-emerald-600"
          />

          {successMessage}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">
            Error de sincronización:
          </p>

          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Ventas Registradas
          </p>

          <p className="mt-2 text-2xl font-bold text-[#0F172A]">
            {sales.length} transacciones
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Ingresos Totales (PEN)
          </p>

          <p className="mt-2 text-2xl font-bold text-[#2563EB]">
            S/ {totalSalesRevenue.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Almacenamiento
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />

            <p className="text-sm font-bold text-emerald-600">
              Supabase PostgreSQL Activo
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de Ventas */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-[#0F172A]">
              Libro de Ventas
            </h3>

            <p className="text-xs text-[#64748B]">
              Historial de compras y operaciones comerciales en línea
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Buscar venta..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-[#0F172A]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  N° Operación
                </th>

                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Sucursal
                </th>

                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Detalles / Artículos
                </th>

                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Importe Total
                </th>

                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredSales.map((sale) => (
                <tr
                  key={sale.id}
                  className="transition hover:bg-slate-50/80"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-50 p-2 text-[#2563EB]">
                        <ShoppingCart size={18} />
                      </div>

                      <div>
                        <span className="font-mono font-bold text-[#0F172A]">
                          VNT-
                          {String(sale.id).padStart(4, '0')}
                        </span>

                        <p className="text-[11px] text-[#64748B]">
                          Trazabilidad 
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 font-medium text-[#0F172A]">
                    {sale.branch_name ||
                      `Sucursal #${sale.branch_id}`}
                  </td>

                  <td className="px-5 py-4">
                    {sale.details &&
                    sale.details.length > 0 ? (
                      <div className="space-y-1">
                        {sale.details.map((d, idx) => (
                          <span
                            key={idx}
                            className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700 mr-1.5"
                          >
                            {d.product_name} × {d.quantity}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-[#64748B]">
                        Detalle registrado
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right font-mono font-bold text-[#0F172A]">
                    S/ {Number(sale.total).toFixed(2)}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() =>
                          setSelectedSale(sale)
                        }
                        className="rounded-lg p-2 text-[#64748B] hover:bg-blue-50 hover:text-[#2563EB] transition"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>

                      {canEdit && (
                        <button
                          onClick={() =>
                            handleDelete(sale.id)
                          }
                          className="rounded-lg p-2 text-[#64748B] hover:bg-red-50 hover:text-red-600 transition"
                          title="Eliminar venta"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSales.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-[#64748B]"
                  >
                    No se encontraron ventas registradas en
                    la base de datos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Venta */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar nueva venta"
        description="Persiste una nueva transacción comercial ."
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            label="Sucursal"
            error={errors.branch_id?.message}
          >
            <select
              {...register('branch_id')}
              className={inputClass}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} (ID: #{b.id})
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Producto"
            error={errors.product_id?.message}
          >
            <select
              {...register('product_id')}
              onChange={handleProductChange}
              className={inputClass}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - S/ {Number(p.price).toFixed(2)}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Cantidad"
              error={errors.quantity?.message}
            >
              <input
                type="number"
                min="1"
                step="1"
                {...register('quantity')}
                className={inputClass}
              />
            </FormField>

            <FormField
              label="Precio unitario (PEN)"
              error={errors.unit_price?.message}
            >
              <input
                type="number"
                step="0.01"
                min="0.01"
                {...register('unit_price')}
                className={inputClass}
              />
            </FormField>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
            <span className="text-sm font-medium text-[#64748B]">
              Subtotal calculado:
            </span>

            <span className="text-xl font-bold font-mono text-[#2563EB]">
              S/ {calculatedSubtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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

              Guardar venta en BD
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detalle Venta */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-[#0F172A]">
                Venta VNT-
                {String(selectedSale.id).padStart(4, '0')}
              </h3>

              <button
                onClick={() => setSelectedSale(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-[#64748B]">
                  Sucursal:
                </span>

                <span className="font-semibold text-[#0F172A]">
                  {selectedSale.branch_name ||
                    `ID #${selectedSale.branch_id}`}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-[#64748B]">
                  Total facturado:
                </span>

                <span className="font-mono font-bold text-[#2563EB]">
                  S/ {Number(selectedSale.total).toFixed(2)}
                </span>
              </div>

              <div>
                <span className="text-xs uppercase text-[#64748B] font-semibold">
                  Detalles del Pedido:
                </span>

                <div className="mt-2 space-y-2">
                  {selectedSale.details?.map(
                    (d, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center rounded-lg bg-slate-50 p-2.5 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-[#0F172A]">
                            {d.product_name}
                          </p>

                          <p className="text-[#64748B]">
                            Cantidad: {d.quantity} × S/{' '}
                            {d.unit_price.toFixed(2)}
                          </p>
                        </div>

                        <span className="font-mono font-bold text-[#0F172A]">
                          S/{' '}
                          {(
                            d.quantity * d.unit_price
                          ).toFixed(2)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setSelectedSale(null)}
                className="rounded-lg bg-[#0F172A] px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
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