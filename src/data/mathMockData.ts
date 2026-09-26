import type { Matrix, Vector } from "../types/math";

export const initialVectors: Vector[] = [
  {
    id: 1,
    name: "Ventas Lima",
    description: "Ventas por producto de la sucursal Lima",
    values: [120, 85, 43, 76, 150],
    createdAt: "2026-09-20",
  },
  {
    id: 2,
    name: "Ventas Arequipa",
    description: "Ventas por producto de la sucursal Arequipa",
    values: [95, 70, 38, 62, 130],
    createdAt: "2026-09-20",
  },
  {
    id: 3,
    name: "Meta Lima",
    description: "Meta de ventas por producto de Lima",
    values: [130, 90, 50, 80, 160],
    createdAt: "2026-09-21",
  },
];

export const initialMatrices: Matrix[] = [
  {
    id: 1,
    name: "Ventas por sucursal",
    description: "Ventas por sucursal y producto",
    rows: 5,
    columns: 5,
    values: [
      [120, 85, 43, 76, 150],
      [95, 70, 38, 62, 130],
      [110, 64, 41, 58, 125],
      [80, 55, 32, 47, 98],
      [90, 61, 35, 52, 105],
    ],
    createdAt: "2026-09-20",
  },
  {
    id: 2,
    name: "Metas por sucursal",
    description: "Metas de ventas por sucursal y producto",
    rows: 5,
    columns: 5,
    values: [
      [130, 90, 50, 80, 160],
      [100, 75, 45, 70, 140],
      [120, 70, 50, 65, 135],
      [90, 60, 40, 55, 110],
      [100, 70, 42, 60, 120],
    ],
    createdAt: "2026-09-21",
  },
];