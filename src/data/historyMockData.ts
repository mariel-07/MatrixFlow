import type { HistoryRecord } from "../types/history";

export const initialHistory: HistoryRecord[] = [
  {
    id: 1,
    category: "Vector",
    operation: "Suma de vectores",
    input: "Ventas Lima + Ventas Arequipa",
    result: "[215, 155, 81, 138, 280]",
    status: "Completada",
    createdAt: "2026-09-22 09:15",
  },
  {
    id: 2,
    category: "Vector",
    operation: "Producto punto",
    input: "Ventas Lima · Ventas Arequipa",
    result: "37,879",
    status: "Completada",
    createdAt: "2026-09-22 09:20",
  },
  {
    id: 3,
    category: "Vector",
    operation: "Producto por escalar",
    input: "2 × Ventas Lima",
    result: "[240, 170, 86, 152, 300]",
    status: "Completada",
    createdAt: "2026-09-22 09:25",
  },
  {
    id: 4,
    category: "Matriz",
    operation: "Transpuesta",
    input: "Ventas por sucursal",
    result: "Matriz 5 × 5",
    status: "Completada",
    createdAt: "2026-09-22 09:30",
  },
  {
    id: 5,
    category: "Matriz",
    operation: "Suma de matrices",
    input: "Ventas por sucursal + Metas por sucursal",
    result: "Matriz 5 × 5",
    status: "Completada",
    createdAt: "2026-09-22 09:35",
  },
];