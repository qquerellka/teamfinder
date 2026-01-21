import { Skill, SkillDTO } from "@/entities/skill";
import { Role } from "@/shared/types/enums";

export type ResponseStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "expired";

export interface Response {
  id: number;
  vacancyId: number;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
  status: ResponseStatus;
  teamId: number;
  skills: Skill[];
  role: Role;
}

export interface ResponseDTO {
  id: number;
  vacancy_id: number;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  status: ResponseStatus;
  team_id: number;
  role: Role;
  skills: SkillDTO[];
}

export interface UpdateResponse {
  status: ResponseStatus;
}

export interface UpdateResponseDTO {
  status: ResponseStatus;
}
