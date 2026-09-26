export type OperationCategory =
  | "vector"
  | "matrix"
  | "linear";

export type VectorOperation =
  | "sum"
  | "subtract"
  | "scalar"
  | "dot";

export type MatrixOperation =
  | "sum"
  | "subtract"
  | "multiply"
  | "transpose"
  | "scalar";

export type OperationType =
  | VectorOperation
  | MatrixOperation
  | "linear_combination";

export interface OperationRecord {
  id: number;
  category: OperationCategory;
  operation: OperationType;
  name: string;
  result: number | number[] | number[][];
  createdAt: string;
}