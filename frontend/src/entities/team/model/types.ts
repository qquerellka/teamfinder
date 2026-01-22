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

export interface MyTeamDTO {
  id: number;
  hackathon_id: number;
  name: string;
  description: string;
  captain_id: number;
  status: TeamStatus;
  hackathon_name: string;
  team_members_count: number;
  team_members_limit: number;
  is_captain: boolean;
  count_invites: number;
}

export interface Team {
  id: number;
  hackathonId: number;
  name: string;
  description: string;
  captainId: number;
  status: TeamStatus;
}

export interface MyTeam {
  id: number;
  hackathonId: number;
  name: string;
  description: string;
  captainId: number;
  status: TeamStatus;
  hackathonName: string;
  teamMembersCount: number;
  teamMembersLimit: number;
  isCaptain: boolean;
  countInvites: number;
}

export interface TeamWithMembers {
  id: number;
  hackathonId: number;
  hackathonName: string;
  teamMembersLimit: number;
  name: string;
  description: string;
  captainId: number;
  status: TeamStatus;
  members: Array<TeamMember>;
}

export interface TeamWithMembersDTO {
  id: number;
  hackathon_id: number;
  hackathon_name: string;
  team_members_limit: number;
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

export interface MyTeamsRsponse {
  offset: number;
  limit: number;
  items: MyTeam[];
}
