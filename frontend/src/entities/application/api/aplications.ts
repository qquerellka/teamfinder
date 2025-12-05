import { apiClient } from "@/shared/api/client";
import {
  Application,
  ApplicationCreate,
  ApplicationDTO,
  ApplicationEdit,
  ApplicationsResponse,
  ApplicationsResponseDTO,
} from "../model/types";
import {
  applicationCreateToDTO,
  applicationEditToDTO,
  applicationsToCamelCase,
} from "../lib/dto";

export async function getHackathonApplications(
  id: number,
): Promise<ApplicationsResponse> {
  const { data } = await apiClient.get<ApplicationsResponseDTO>(
    `/hackathons/${id}/applications`,
  );
  return {
    offset: data.offset,
    limit: data.limit,
    items: applicationsToCamelCase(data.items),
  };
}

export async function getAuthUserApplicationOnHackathon(
  id: number,
): Promise<Application> {
  const { data } = await apiClient.get<ApplicationDTO>(
    `/hackathons/${id}/applications/me`,
  );
  return applicationsToCamelCase([data])[0];
}

export async function getAuthUserApplications(): Promise<Application[]> {
  const { data } = await apiClient.get<ApplicationDTO[]>(`/me/applications`);
  return applicationsToCamelCase(data);
}

export async function createHackathonApplication(
  id: number,
  app: ApplicationCreate,
): Promise<Application> {
  const payload = applicationCreateToDTO(app);
  const { data } = await apiClient.post<ApplicationDTO>(
    `/hackathons/${id}/applications`,
    payload,
  );
  return applicationsToCamelCase([data])[0];
}

export async function getAuthUserApplication(id: number): Promise<Application> {
  const { data } = await apiClient.get<ApplicationDTO>(`/applications/${id}`);
  return applicationsToCamelCase([data])[0];
}

export async function deleteAuthUserApplication(id: number): Promise<void> {
  await apiClient.delete(`/applications/${id}`);
}

export async function editAuthUserApplication(
  id: number,
  app: ApplicationEdit,
): Promise<Application> {
  const payload = applicationEditToDTO(app);
  const { data } = await apiClient.patch<ApplicationDTO>(
    `/applications/${id}`,
    payload,
  );
  return applicationsToCamelCase([data])[0];
}
