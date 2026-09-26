import api from "./api";

export interface MatrixPayload {
  name: string;
  description?: string;
  values: number[][];
}

export interface MatrixResponse {
  id: number;
  name: string;
  description: string | null;
  values: number[][];
}

export async function getMatrices(): Promise<MatrixResponse[]> {
  const response = await api.get<MatrixResponse[]>(
    "/api/v1/matrices/"
  );

  return response.data;
}

export async function getMatrix(
  id: number
): Promise<MatrixResponse> {
  const response = await api.get<MatrixResponse>(
    `/api/v1/matrices/${id}`
  );

  return response.data;
}

export async function createMatrix(
  data: MatrixPayload
): Promise<MatrixResponse> {
  const response = await api.post<MatrixResponse>(
    "/api/v1/matrices/",
    data
  );

  return response.data;
}

export async function updateMatrix(
  id: number,
  data: MatrixPayload
): Promise<MatrixResponse> {
  const response = await api.put<MatrixResponse>(
    `/api/v1/matrices/${id}`,
    data
  );

  return response.data;
}

export async function deleteMatrix(
  id: number
): Promise<void> {
  await api.delete(`/api/v1/matrices/${id}`);
}