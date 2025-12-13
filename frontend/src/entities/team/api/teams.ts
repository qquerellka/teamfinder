import { apiClient } from "@/shared/api/client";
import {
  CreateTeam,
  EditTeam,
  Team,
  TeamDTO,
  TeamWithMembers,
  TeamWithMembersDTO,
} from "../model/types";
import {
  createTeamToDTO,
  editTeamToDTO,
  teamsResponseToCamelCase,
  teamsToCamelCase,
  teamWithMembersToCamelCase,
} from "../lib/dto";
import { Role } from "@/shared/types/enums";

interface TeamsDTOResponse {
  offset: number;
  limit: number;
  items: TeamDTO[];
}

interface TeamsResponse {
  offset: number;
  limit: number;
  items: Team[];
}

export async function getHackathonTeams(id: number): Promise<TeamsResponse> {
  const { data } = await apiClient.get<TeamsDTOResponse>(
    `/hackathons/${id}/teams`
  );
  return teamsResponseToCamelCase(data);
}

export async function createTeam(
  payload: CreateTeam,
  hackId: number
): Promise<Team> {
  const { data } = await apiClient.post<TeamDTO>(
    `/hackathons/${hackId}/teams`,
    createTeamToDTO(payload)
  );
  return teamsToCamelCase([data])[0];
}

export async function getMyTeams(): Promise<TeamsResponse> {
  const { data } = await apiClient.get<TeamsDTOResponse>(`/me/teams`);
  return teamsResponseToCamelCase(data);
}

export async function getMyTeamOnHackathon(
  hackId: number
): Promise<TeamWithMembers | null> {
  const { data } = await apiClient.get<TeamWithMembersDTO | null>(
    `/hackathons/${hackId}/teams/me`
  );
  if (data === null) {
    return null;
  }
  return teamWithMembersToCamelCase(data);
}

export async function getTeam(id: number): Promise<TeamWithMembers> {
  const { data } = await apiClient.get<TeamWithMembersDTO>(`/teams/${id}`);
  return teamWithMembersToCamelCase(data);
}

export async function editTeam(id: number, payload: EditTeam): Promise<Team> {
  const { data } = await apiClient.patch<TeamDTO>(
    `/teams/${id}`,
    editTeamToDTO(payload)
  );
  return teamsToCamelCase([data])[0];
}

export async function deleteTeam(id: number): Promise<void> {
  await apiClient.delete<void>(`/teams/${id}`);
}

export async function getTeamJoinLink(id: number): Promise<string> {
  const { data } = await apiClient.get<{ url: string }>(
    `/teams/${id}/join-link`
  );
  return data.url;
}

export async function joinTeamMe(id: number, role: Role): Promise<void> {
  await apiClient.post(`/teams/${id}/members/me`, { role });
}
