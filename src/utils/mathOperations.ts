export function sumVectors(
    a: number[],
    b: number[]
  ): number[] {
    if (a.length !== b.length) {
      throw new Error(
        "Los vectores deben tener la misma dimensión."
      );
    }
  
    return a.map((value, index) => value + b[index]);
  }
  
  export function subtractVectors(
    a: number[],
    b: number[]
  ): number[] {
    if (a.length !== b.length) {
      throw new Error(
        "Los vectores deben tener la misma dimensión."
      );
    }
  
    return a.map((value, index) => value - b[index]);
  }
  
  export function scalarMultiplyVector(
    scalar: number,
    vector: number[]
  ): number[] {
    return vector.map((value) => scalar * value);
  }
  
  export function dotProduct(
    a: number[],
    b: number[]
  ): number {
    if (a.length !== b.length) {
      throw new Error(
        "Los vectores deben tener la misma dimensión."
      );
    }
  
    return a.reduce(
      (sum, value, index) =>
        sum + value * b[index],
      0
    );
  }
  
  export function sumMatrices(
    a: number[][],
    b: number[][]
  ): number[][] {
    validateSameMatrixDimensions(a, b);
  
    return a.map((row, rowIndex) =>
      row.map(
        (value, columnIndex) =>
          value + b[rowIndex][columnIndex]
      )
    );
  }
  
  export function subtractMatrices(
    a: number[][],
    b: number[][]
  ): number[][] {
    validateSameMatrixDimensions(a, b);
  
    return a.map((row, rowIndex) =>
      row.map(
        (value, columnIndex) =>
          value - b[rowIndex][columnIndex]
      )
    );
  }
  
  export function scalarMultiplyMatrix(
    scalar: number,
    matrix: number[][]
  ): number[][] {
    return matrix.map((row) =>
      row.map((value) => scalar * value)
    );
  }
  
  export function transposeMatrix(
    matrix: number[][]
  ): number[][] {
    if (matrix.length === 0) {
      return [];
    }
  
    return matrix[0].map((_, columnIndex) =>
      matrix.map(
        (row) => row[columnIndex]
      )
    );
  }
  
  export function multiplyMatrices(
    a: number[][],
    b: number[][]
  ): number[][] {
    if (a.length === 0 || b.length === 0) {
      throw new Error(
        "Las matrices no pueden estar vacías."
      );
    }
  
    const aColumns = a[0].length;
    const bRows = b.length;
  
    if (aColumns !== bRows) {
      throw new Error(
        "Para multiplicar matrices, las columnas de A deben coincidir con las filas de B."
      );
    }
  
    const result: number[][] = [];
  
    for (let i = 0; i < a.length; i++) {
      const row: number[] = [];
  
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0;
  
        for (let k = 0; k < aColumns; k++) {
          sum += a[i][k] * b[k][j];
        }
  
        row.push(sum);
      }
  
      result.push(row);
    }
  
    return result;
  }
  
  export function linearCombination(
    coefficients: number[],
    vectors: number[][]
  ): number[] {
    if (coefficients.length !== vectors.length) {
      throw new Error(
        "La cantidad de coeficientes debe coincidir con la cantidad de vectores."
      );
    }
  
    if (vectors.length === 0) {
      throw new Error(
        "Debe existir al menos un vector."
      );
    }
  
    const dimension = vectors[0].length;
  
    for (const vector of vectors) {
      if (vector.length !== dimension) {
        throw new Error(
          "Todos los vectores deben tener la misma dimensión."
        );
      }
    }
  
    return Array.from(
      { length: dimension },
      (_, index) =>
        vectors.reduce(
          (sum, vector, vectorIndex) =>
            sum +
            coefficients[vectorIndex] *
              vector[index],
          0
        )
    );
  }
  
  function validateSameMatrixDimensions(
    a: number[][],
    b: number[][]
  ): void {
    if (
      a.length !== b.length ||
      a[0]?.length !== b[0]?.length
    ) {
      throw new Error(
        "Las matrices deben tener las mismas dimensiones."
      );
    }
  }