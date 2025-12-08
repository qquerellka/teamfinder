import { apiClient } from "@/shared/api/client";
import { EditVacancy, Vacancy, VacancyDTO } from "../model/types";
import { editVacancyToDTO, vacanciesToCamelCase } from "../lib/dto";

interface VacanciesResponseDTO {
  items: VacancyDTO[];
  offset: number;
  limit: number;
}

export async function teamVacancies(id: number): Promise<Vacancy[]> {
  const { data } = await apiClient.get<VacanciesResponseDTO>(
    `/teams/${id}/vacancies`
  );
  return vacanciesToCamelCase(data.items);
}

export async function createVacancy(id: number): Promise<Vacancy> {
  const { data } = await apiClient.post<VacancyDTO>(`/teams/${id}/vacancies`);
  return vacanciesToCamelCase([data])[0];
}

export async function getAllVacancies(): Promise<Vacancy[]> {
  const { data } = await apiClient.get<VacanciesResponseDTO>(`/vacancies`);
  return vacanciesToCamelCase(data.items);
}

export async function getVacancy(id: number): Promise<Vacancy> {
  const { data } = await apiClient.get<VacancyDTO>(`/vacancies/${id}`);
  return vacanciesToCamelCase([data])[0];
}

export async function editVacancy(payload: EditVacancy, id: number): Promise<Vacancy> {
  const { data } = await apiClient.patch<VacancyDTO>(`/vacancies/${id}`, editVacancyToDTO(payload));
  return vacanciesToCamelCase([data])[0];
}

export async function deleteVacancy(id: number): Promise<void> {
  await apiClient.delete<void>(`/vacancies/${id}`);
}

export async function hackathonVacancies(id: number): Promise<Vacancy[]> {
  const { data } = await apiClient.get<VacanciesResponseDTO>(
    `/hackathons/${id}/vacancies`
  );
  return vacanciesToCamelCase(data.items);
}
