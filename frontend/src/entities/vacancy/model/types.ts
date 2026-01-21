import { Role } from "@/shared/types/enums";
type VacancyStatus = "open" | "closed";

export interface Vacancy {
  id: number;
  teamId: number;
  teamName: string;
  role: Role;
  description: string;
  status: VacancyStatus;
}

export interface VacancyDTO {
  id: number;
  team_id: number;
  team_name: string;
  role: Role;
  description: string;
  status: VacancyStatus;
}

export interface EditVacancyDTO {
  role: Role;
  description: string;
  status?: VacancyStatus;
}

export interface EditVacancy {
  role: Role;
  description: string;
  status?: VacancyStatus;
}

export interface CreateVacancy {
  role: Role;
  description: string;
}
