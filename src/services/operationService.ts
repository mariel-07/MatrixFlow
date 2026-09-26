import api from "./api";

export interface OperationPayload {
  operation_type: string;
  inputs: unknown[];
}

export interface OperationResponse {
  id: number;
  operation_type: string;
  inputs: unknown[];
  result: unknown;
  status: string;
  created_at: string | null;
}

export async function executeOperation(
  data: OperationPayload
): Promise<OperationResponse> {
  const response =
    await api.post<OperationResponse>(
      "/api/v1/operations/",
      data
    );

  return response.data;
}

export async function getOperations(): Promise<
  OperationResponse[]
> {
  const response =
    await api.get<OperationResponse[]>(
      "/api/v1/operations/"
    );

  return response.data;
}