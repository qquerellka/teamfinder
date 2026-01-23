import { EditVacancy, EditVacancyDTO, Vacancy, VacancyDTO } from '../model/types';

export function vacanciesToCamelCase(vacancies: VacancyDTO[]): Vacancy[] {
  return vacancies.map(v => ({
    id: v.id,
    description: v.description,
    teamId: v.team_id,
    teamName: v.team_name,
    role: v.role,
    status: v.status,
  }));
}

export function editVacancyToDTO(payload: EditVacancy): EditVacancyDTO {
  return {
    role: payload.role,
    description: payload.description,
    status: payload?.status,
  };
}
