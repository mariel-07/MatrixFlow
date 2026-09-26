export type HistoryCategory =
  | "Vector"
  | "Matriz"
  | "Combinación lineal";

export interface HistoryRecord {
  id: number;
  category: HistoryCategory;
  operation: string;
  input: string;
  result: string;
  status: "Completada" | "Error";
  createdAt: string;
}