import { apiClient } from '@/shared/api/client';
import { AddTeamMember, EditTeamMember, TeamMember, TeamMemberDTO } from '../model/types';
import { addTeamMemberToDTO, editTeamMemberToDTO, teamMembersToCamelCase } from '../lib/dto';

interface TeamMembersResponseDTO {
  items: TeamMemberDTO[];
}

export async function getTeamMembers(id: number): Promise<TeamMember[]> {
  const { data } = await apiClient.get<TeamMembersResponseDTO>(`/teams/${id}/members`);
  return teamMembersToCamelCase(data.items);
}

export async function addTeamMember(id: number, payload: AddTeamMember): Promise<TeamMember> {
  const { data } = await apiClient.post<TeamMemberDTO>(
    `/teams/${id}/members`,
    addTeamMemberToDTO(payload),
  );
  return teamMembersToCamelCase([data])[0];
}

export async function editTeamMember(id: number, payload: EditTeamMember): Promise<TeamMember> {
  const { data } = await apiClient.patch<TeamMemberDTO>(
    `/teams/${id}/members`,
    editTeamMemberToDTO(payload),
  );
  return teamMembersToCamelCase([data])[0];
}

export async function deleteTeamMember(teamId: number, userId: number): Promise<void> {
  await apiClient.delete<void>(`/teams/${teamId}/members/${userId}`);
}

export async function leaveTeam(id: number): Promise<void> {
  await apiClient.delete<void>(`/teams/${id}/members/me`);
}
