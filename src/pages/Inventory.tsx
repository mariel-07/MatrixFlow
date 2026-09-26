import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  PackageX,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Warehouse,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import PageHeader from '../components/common/PageHeader'
import api from '../services/api'

interface InventoryItem {
  id: number
  product_id: number
  branch_id: number
  quantity: number
  product_name?: string
  branch_name?: string
}

interface Product {
  id: number
  name: string
  code?: string
  price: number
}

interface Branch {
  id: number
  name: string
  city?: string
}

export default function Inventory() {
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [branchFilter, setBranchFilter] = useState<string>('all')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    product_id: '',
    branch_id: '',
    quantity: '10',
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [invRes, prodRes, branchRes] = await Promise.all([
        api.get('/api/v1/inventory/'),
        api.get('/api/v1/products/'),
        api.get('/api/v1/branches/'),
      ])
      setInventoryList(invRes.data)
      setProducts(prodRes.data)
      setBranches(branchRes.data)
    } catch (err: any) {
      console.error('Error fetching inventory:', err)
      setError(err?.response?.data?.detail || 'Error al conectar con la base de datos de inventario.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredInventory = useMemo(() => {
    return inventoryList.filter((item) => {
      const matchBranch = branchFilter === 'all' || item.branch_id.toString() === branchFilter
      const text = `${item.product_name ?? ''} ${item.branch_name ?? ''}`.toLowerCase()
      const matchSearch = text.includes(search.toLowerCase())
      return matchBranch && matchSearch
    })
  }, [inventoryList, search, branchFilter])

  const totalUnits = useMemo(() => {
    return inventoryList.reduce((total, item) => total + (item.quantity || 0), 0)
  }, [inventoryList])

  const lowStockCount = useMemo(() => {
    return inventoryList.filter((item) => item.quantity > 0 && item.quantity <= 10).length
  }, [inventoryList])

  const outOfStockCount = useMemo(() => {
    return inventoryList.filter((item) => item.quantity === 0).length
  }, [inventoryList])

  const normalStockCount = useMemo(() => {
    return inventoryList.filter((item) => item.quantity > 10).length
  }, [inventoryList])

  const openModal = (item?: InventoryItem) => {
    if (item) {
      setFormData({
        product_id: item.product_id.toString(),
        branch_id: item.branch_id.toString(),
        quantity: item.quantity.toString(),
      })
    } else {
      setFormData({
        product_id: products[0]?.id ? products[0].id.toString() : '',
        branch_id: branches[0]?.id ? branches[0].id.toString() : '',
        quantity: '10',
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.product_id || !formData.branch_id) {
      alert('Por favor selecciona producto y sucursal.')
      return
    }

    try {
      setSubmitting(true)
      await api.post('/api/v1/inventory/', {
        product_id: parseInt(formData.product_id),
        branch_id: parseInt(formData.branch_id),
        quantity: parseFloat(formData.quantity) || 0,
      })
      setSuccessMessage('Existencia de inventario sincronizada exitosamente en Supabase.')
      setTimeout(() => setSuccessMessage(null), 3500)
      closeModal()
      await fetchData()
    } catch (err: any) {
      console.error('Error saving inventory:', err)
      alert(err?.response?.data?.detail || 'No se pudo guardar el registro de inventario.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Deseas retirar este registro de existencias del inventario?')) return

    try {
      await api.delete(`/api/v1/inventory/${id}`)
      setInventoryList((prev) => prev.filter((item) => item.id !== id))
      setSuccessMessage('Registro eliminado de la base de datos.')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      console.error('Error deleting inventory item:', err)
      alert(err?.response?.data?.detail || 'Error al eliminar el registro.')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario"
        description="Existencias en tiempo real sincronizadas con Supabase PostgreSQL por sucursal."
        action={
          <div className="flex gap-2">
            <button
              onClick={() => fetchData()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-[#0F172A] shadow-sm hover:bg-slate-50 transition"
              title="Recargar datos de la BD"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin text-[#2563EB]' : 'text-[#64748B]'} />
              Sincronizar
            </button>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <Plus size={18} />
              Ajustar / Agregar Stock
            </button>
          </div>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Unidades Totales</p>
              <p className="mt-2 text-2xl font-bold text-[#0F172A]">{totalUnits.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-[#2563EB]">
              <Warehouse size={22} />
            </div>
          </div>
          <p className="mt-2 text-xs text-[#06B6D4] font-medium flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#06B6D4]"></span>
            Conexión en vivo con Supabase
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Stock Óptimo</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">{normalStockCount}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <Boxes size={22} />
            </div>
          </div>
          <p className="mt-2 text-xs text-[#64748B]">Existencias &gt; 10 unidades</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Stock Bajo</p>
              <p className="mt-2 text-2xl font-bold text-amber-600">{lowStockCount}</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
              <AlertTriangle size={22} />
            </div>
          </div>
          <p className="mt-2 text-xs text-[#64748B]">Existencias entre 1 y 10 unidades</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Agotados</p>
              <p className="mt-2 text-2xl font-bold text-red-600">{outOfStockCount}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3 text-red-600">
              <PackageX size={22} />
            </div>
          </div>
          <p className="mt-2 text-xs text-[#64748B]">Existencias en 0 unidades</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-[#0F172A]">Registros de Existencias</h3>
            <p className="text-sm text-[#64748B]">Stock disponible por producto y ubicación física en almacén</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by Branch */}
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            >
              <option value="all">Todas las sucursales</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id.toString()}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por producto..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-sm text-[#64748B] flex flex-col items-center justify-center gap-2">
              <RefreshCw className="animate-spin text-[#2563EB]" size={24} />
              Cargando existencias desde Supabase...
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#64748B]">
              No se encontraron registros de inventario coincidentes.
            </div>
          ) : (
            <table className="w-full min-w-[700px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Producto
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Sucursal
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Stock Físico
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Estado
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => {
                  const isLow = item.quantity > 0 && item.quantity <= 10
                  const isEmpty = item.quantity === 0

                  return (
                    <tr key={item.id} className="transition hover:bg-slate-50/80">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-blue-50 p-2 text-[#2563EB]">
                            <Boxes size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0F172A]">
                              {item.product_name || `Producto #${item.product_id}`}
                            </p>
                            <p className="text-xs text-[#64748B]">ID Ref: {item.product_id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-[#0F172A]">
                        {item.branch_name || `Sucursal #${item.branch_id}`}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span
                          className={`text-base font-bold ${
                            isEmpty
                              ? 'text-red-600'
                              : isLow
                              ? 'text-amber-600'
                              : 'text-[#0F172A]'
                          }`}
                        >
                          {item.quantity}
                        </span>
                        <span className="ml-1 text-xs text-[#64748B]">uds.</span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isEmpty
                              ? 'bg-red-50 text-red-700'
                              : isLow
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isEmpty ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          ></span>
                          {isEmpty ? 'Agotado' : isLow ? 'Stock Bajo' : 'Normal'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openModal(item)}
                            className="rounded-lg border border-slate-200 p-1.5 text-[#64748B] hover:bg-slate-100 hover:text-[#2563EB] transition"
                            title="Ajustar Stock"
                          >
                            <RefreshCw size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded-lg border border-slate-200 p-1.5 text-[#64748B] hover:bg-red-50 hover:text-red-600 transition"
                            title="Eliminar Registro"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Ajustar/Registrar Stock */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-[#0F172A]">Ajustar Stock en Base de Datos</h3>
              <button onClick={closeModal} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1">
                  Producto
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none"
                  required
                >
                  <option value="">Selecciona un producto...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id.toString()}>
                      {p.name} {p.code ? `(${p.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1">
                  Sucursal
                </label>
                <select
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none"
                  required
                >
                  <option value="">Selecciona una sucursal...</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id.toString()}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1">
                  Cantidad en Existencia
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar en Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}