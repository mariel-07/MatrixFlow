export interface Company {
    id: number
    name: string
    ruc: string
    phone: string
    email: string
    address: string
    status: 'Activo' | 'Inactivo'
  }
  
  export interface Branch {
    id: number
    name: string
    code: string
    city: string
    address: string
    phone: string
    manager: string
    status: 'Activo' | 'Inactivo'
  }
  
  export interface Product {
    id: number
    code: string
    name: string
    category: string
    price: number
    stock: number
    minStock: number
    status: 'Activo' | 'Inactivo'
  }
  
  export interface Sale {
    id: number
    code: string
    date: string
    branchId: number
    productId: number
    quantity: number
    unitPrice: number
    total: number
    status: 'Completada' | 'Anulada'
  }
  
  export interface InventoryItem {
    id: number
    productId: number
    branchId: number
    stock: number
    minStock: number
    status: 'Normal' | 'Stock bajo' | 'Sin stock'
  }
  
  export const company: Company = {
    id: 1,
    name: 'MatrixFlow Comercial S.A.C.',
    ruc: '20601234567',
    phone: '+51 987 654 321',
    email: 'contacto@matrixflow.com',
    address: 'Av. Industrial 1250, Lima',
    status: 'Activo',
  }
  
  export const branches: Branch[] = [
    {
      id: 1,
      name: 'Lima',
      code: 'LIM-001',
      city: 'Lima',
      address: 'Av. Industrial 1250',
      phone: '+51 987 111 222',
      manager: 'Carlos Mendoza',
      status: 'Activo',
    },
    {
      id: 2,
      name: 'Arequipa',
      code: 'ARE-001',
      city: 'Arequipa',
      address: 'Av. Ejército 450',
      phone: '+51 987 222 333',
      manager: 'Ana Torres',
      status: 'Activo',
    },
    {
      id: 3,
      name: 'Trujillo',
      code: 'TRU-001',
      city: 'Trujillo',
      address: 'Av. España 720',
      phone: '+51 987 333 444',
      manager: 'Luis Ramírez',
      status: 'Activo',
    },
    {
      id: 4,
      name: 'Cusco',
      code: 'CUS-001',
      city: 'Cusco',
      address: 'Av. La Cultura 890',
      phone: '+51 987 444 555',
      manager: 'María Flores',
      status: 'Activo',
    },
    {
      id: 5,
      name: 'Piura',
      code: 'PIU-001',
      city: 'Piura',
      address: 'Av. Grau 620',
      phone: '+51 987 555 666',
      manager: 'Jorge Castillo',
      status: 'Activo',
    },
  ]
  
  export const products: Product[] = [
    {
      id: 1,
      code: 'LAP-001',
      name: 'Laptop empresarial',
      category: 'Laptops',
      price: 2899.9,
      stock: 42,
      minStock: 10,
      status: 'Activo',
    },
    {
      id: 2,
      code: 'PC-001',
      name: 'PC de escritorio',
      category: 'Computadoras',
      price: 2199.9,
      stock: 35,
      minStock: 10,
      status: 'Activo',
    },
    {
      id: 3,
      code: 'MON-001',
      name: 'Monitor 24 pulgadas',
      category: 'Monitores',
      price: 699.9,
      stock: 68,
      minStock: 15,
      status: 'Activo',
    },
    {
      id: 4,
      code: 'TEC-001',
      name: 'Teclado mecánico',
      category: 'Periféricos',
      price: 249.9,
      stock: 85,
      minStock: 20,
      status: 'Activo',
    },
    {
      id: 5,
      code: 'MOU-001',
      name: 'Mouse inalámbrico',
      category: 'Periféricos',
      price: 119.9,
      stock: 120,
      minStock: 25,
      status: 'Activo',
    },
  ]
  
  export const sales: Sale[] = [
    {
      id: 1,
      code: 'V-001',
      date: '2026-09-20',
      branchId: 1,
      productId: 1,
      quantity: 2,
      unitPrice: 2899.9,
      total: 5799.8,
      status: 'Completada',
    },
    {
      id: 2,
      code: 'V-002',
      date: '2026-09-20',
      branchId: 2,
      productId: 2,
      quantity: 4,
      unitPrice: 699.9,
      total: 2799.6,
      status: 'Completada',
    },
    {
      id: 3,
      code: 'V-003',
      date: '2026-09-21',
      branchId: 1,
      productId: 3,
      quantity: 3,
      unitPrice: 899.9,
      total: 2699.7,
      status: 'Completada',
    },
    {
      id: 4,
      code: 'V-004',
      date: '2026-09-21',
      branchId: 3,
      productId: 4,
      quantity: 10,
      unitPrice: 129.9,
      total: 1299,
      status: 'Completada',
    },
    {
      id: 5,
      code: 'V-005',
      date: '2026-09-22',
      branchId: 4,
      productId: 5,
      quantity: 15,
      unitPrice: 69.9,
      total: 1048.5,
      status: 'Completada',
    },
  ]
  
  export const inventory: InventoryItem[] = [
    {
      id: 1,
      productId: 1,
      branchId: 1,
      stock: 42,
      minStock: 10,
      status: 'Normal',
    },
    {
      id: 2,
      productId: 2,
      branchId: 2,
      stock: 8,
      minStock: 10,
      status: 'Stock bajo',
    },
    {
      id: 3,
      productId: 3,
      branchId: 1,
      stock: 68,
      minStock: 15,
      status: 'Normal',
    },
    {
      id: 4,
      productId: 4,
      branchId: 3,
      stock: 120,
      minStock: 20,
      status: 'Normal',
    },
    {
      id: 5,
      productId: 5,
      branchId: 4,
      stock: 5,
      minStock: 10,
      status: 'Stock bajo',
    },
  ]