import api from "./api";

export interface VectorPayload {
  name: string;
  description?: string | null;
  values: number[];
}

export interface VectorResponse {
  id: number;
  name: string;
  description: string | null;
  values: number[];
}

export async function getVectors(): Promise<VectorResponse[]> {
  const response = await api.get<VectorResponse[]>(
    "/api/v1/vectors/"
  );

  return response.data;
}

export async function getVector(
  id: number
): Promise<VectorResponse> {
  const response = await api.get<VectorResponse>(
    `/api/v1/vectors/${id}`
  );

  return response.data;
}

export async function createVector(
  data: VectorPayload
): Promise<VectorResponse> {
  const response = await api.post<VectorResponse>(
    "/api/v1/vectors/",
    data
  );

  return response.data;
}

export async function updateVector(
  id: number,
  data: VectorPayload
): Promise<VectorResponse> {
  const response = await api.put<VectorResponse>(
    `/api/v1/vectors/${id}`,
    data
  );

  return response.data;
}

export async function deleteVector(
  id: number
): Promise<void> {
  await api.delete(`/api/v1/vectors/${id}`);
}