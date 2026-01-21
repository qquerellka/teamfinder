import { apiClient } from "@/shared/api/client";
import { ResponseDTO, Response, UpdateResponse } from "../model/types";
import { responsesToCamelCase, updateResponseToDTO } from "../lib/dto";

interface ResponsesResponseDTO {
  items: ResponseDTO[];
  limit: number;
  offset: number;
}

export async function getVacancyResponses(id: number): Promise<Response[]> {
  const { data } = await apiClient.get<ResponsesResponseDTO>(
    `/vacancies/${id}/responses`
  );
  return responsesToCamelCase(data.items);
}

export async function createVacancyResponse(id: number): Promise<Response> {
  const { data } = await apiClient.post<ResponseDTO>(
    `/vacancies/${id}/responses`
  );
  return responsesToCamelCase([data])[0];
}

export async function getResponse(id: number): Promise<Response> {
  const { data } = await apiClient.get<ResponseDTO>(`/responses/${id}`);
  return responsesToCamelCase([data])[0];
}

export async function updateResponse(
  id: number,
  payload: UpdateResponse
): Promise<Response> {
  const { data } = await apiClient.patch<ResponseDTO>(
    `/responses/${id}`,
    updateResponseToDTO(payload)
  );
  return responsesToCamelCase([data])[0];
}

export async function deleteResponse(id: number): Promise<void> {
  await apiClient.delete<ResponseDTO>(`/responses/${id}`);
}

export async function getAllResponses(): Promise<Response[]> {
  const { data } = await apiClient.get<ResponsesResponseDTO>(`/me/responses`);
  return responsesToCamelCase(data.items);
}

export async function getAllTeamResponses(teamId: number): Promise<Response[]> {
  const { data } = await apiClient.get<ResponsesResponseDTO>(`/teams/${teamId}/responses`);
  return responsesToCamelCase(data.items) 
}