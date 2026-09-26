export interface Vector {
    id: number;
    name: string;
    description: string;
    values: number[];
    createdAt: string;
  }
  
  export interface Matrix {
    id: number;
    name: string;
    description: string;
    rows: number;
    columns: number;
    values: number[][];
    createdAt: string;
  }