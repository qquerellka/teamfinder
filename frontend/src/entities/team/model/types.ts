import { TeamMember, TeamMemberDTO } from "@/entities/teamMember";
import { Role } from "@/shared/types/enums";

export type TeamStatus = "forming" | "ready";

export interface TeamDTO {
  id: number;
  hackathon_id: number;
  name: string;
  description: string;
  captain_id: number;
  status: TeamStatus;
}

export interface Team {
  id: number;
  hackathonId: number;
  name: string;
  description: string;
  captainId: number;
  status: TeamStatus;
}

export interface TeamWithMembers {
  id: number;
  hackathonId: number;
  name: string;
  description: string;
  captainId: number;
  status: TeamStatus;
  members: Array<TeamMember>;
}

export interface TeamWithMembersDTO {
  id: number;
  hackathon_id: number;
  name: string;
  description: string;
  captain_id: number;
  status: TeamStatus;
  members: Array<TeamMemberDTO>;
}

export interface CreateTeamDTO {
  role: Role;
  name: string;
  description: string;
}

export interface CreateTeam {
  role: Role;
  name: string;
  description: string;
}

export interface EditTeamDTO {
  name: string;
  description: string;
  status?: TeamStatus;
}

export interface EditTeam {
  name: string;
  description: string;
  status?: TeamStatus;
}

export interface TeamsDTOResponse {
  offset: number;
  limit: number;
  items: TeamDTO[];
}

export interface TeamsResponse {
  offset: number;
  limit: number;
  items: Team[];
}
