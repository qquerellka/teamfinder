import { apiClient } from '@/shared/api/client';
import {
  CreateInvite,
  Invite,
  InviteDTO,
  MegaInvite,
  MegaInviteDTO,
  UpdateInvite,
} from '../model/types';
import {
  createInviteToDTO,
  invitesToCamelCase,
  megaInvitesToCamelCase,
  updateInviteToDTO,
} from '../lib/dto';

export async function getTeamInvites(id: number): Promise<Invite[]> {
  const { data } = await apiClient.get<InviteDTO[]>(`/teams/${id}/invites`);
  return invitesToCamelCase(data);
}

export async function createTeamInvite(id: number, payload: CreateInvite): Promise<Invite> {
  const { data } = await apiClient.post<Omit<InviteDTO, 'user_name' | 'application_user_id'>>(
    `/teams/${id}/invites`,
    createInviteToDTO(payload),
  );
  return invitesToCamelCase([data])[0];
}

export async function getApplicationInvites(id: number): Promise<MegaInvite[]> {
  const { data } = await apiClient.get<MegaInviteDTO[]>(`/applications/${id}/invites`);
  return megaInvitesToCamelCase(data);
}

export async function getAllInvites(): Promise<Invite[]> {
  const { data } = await apiClient.get<InviteDTO[]>(`/me/invites`);
  return invitesToCamelCase(data);
}

export async function getInvite(id: number): Promise<Invite> {
  const { data } = await apiClient.get<InviteDTO>(`/invites/${id}`);
  return invitesToCamelCase([data])[0];
}

export async function updateInvite(id: number, payload: UpdateInvite): Promise<Invite> {
  const { data } = await apiClient.patch<InviteDTO>(`/invites/${id}`, updateInviteToDTO(payload));
  return invitesToCamelCase([data])[0];
}
