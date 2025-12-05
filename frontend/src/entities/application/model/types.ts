import { Skill, SkillDTO } from "@/entities/skill/model/types";
import { Role } from "@/shared/types/enums";

export interface ApplicationDTO {
  id: number;
  hackathon_id: number;
  user_id: number;
  role: string;
  username: string;
  first_name: string;
  last_name: string;
  skills: SkillDTO[];
  registration_end_date: string;
}

export interface ApplicationsResponseDTO {
  items: ApplicationDTO[],
  offset: number,
  limit: number,
}

export interface Application {
  id: number;
  hackathonId: number;
  userId: number;
  role: Role;
  username: string;
  firstName: string;
  lastName: string;
  skills: Skill[];
  registrationEndDate: string;
}

export interface ApplicationsResponse {
  offset: number,
  limit: number,
  items: Application[],
}

export interface ApplicationCreate {
  role: Role;
}

export interface ApplicationCreateDTO {
  role: Role
}

export interface ApplicationEdit {
  role: Role;
}

export interface ApplicationEditDTO {
  role: Role;
}