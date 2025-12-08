import { Role } from "@/shared/types/enums";
type VacancyStatus = "open" | "closed";

export interface Vacancy {
  id: number;
  teamId: number;
  role: Role;
  description: string;
  status: VacancyStatus;
}

export interface VacancyDTO {
  id: number;
  team_id: number;
  role: Role;
  description: string;
  status: VacancyStatus;
}


export interface EditVacancyDTO {
    role: Role,
    description: string,
    status?: VacancyStatus,
}

export interface EditVacancy {
    role: Role,
    description: string,
    status?: VacancyStatus,
}