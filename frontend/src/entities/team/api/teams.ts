import { apiClient } from "@/shared/api/client";
import { CreateTeam, EditTeam, Team, TeamDTO, TeamWithMembers, TeamWithMembersDTO } from "../model/types";
import {
  createTeamToDTO,
  editTeamToDTO,
  teamsResponseToCamelCase,
  teamsToCamelCase,
  teamWithMembersToCamelCase,
} from "../lib/dto";

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

export async function getMyTeamOnHackathon(hackId: number): Promise<TeamWithMembers | null> {
  const { data } = await apiClient.get<TeamWithMembersDTO | null>(
    `/hackathons/${hackId}/teams/me`
  );
  if (data === null) {
    return null;
  }
  return teamWithMembersToCamelCase(data);
}

export async function getTeam(id: number): Promise<Team> {
  const { data } = await apiClient.get<TeamDTO>(`/teams/${id}`);
  return teamsToCamelCase([data])[0];
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
