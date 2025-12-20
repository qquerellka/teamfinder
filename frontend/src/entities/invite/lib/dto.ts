import {
  CreateInvite,
  CreateInviteDTO,
  Invite,
  InviteDTO,
  MegaInvite,
  MegaInviteDTO,
  UpdateInvite,
  UpdateInviteDTO,
} from "../model/types";

export function invitesToCamelCase(invites: InviteDTO[]): Invite[] {
  return invites.map((i) => ({
    id: i.id,
    status: i.status,
    role: i.invited_role,
    teamId: i.team_id,
    applicationId: i.application_id,
    userId: i.application_user_id,
    username: i.user_name,
    teamName: i.team_name,
  }));
}

export function megaInvitesToCamelCase(invites: MegaInviteDTO[]): MegaInvite[] {
  return invites.map((i) => ({
    id: i.id,
    status: i.status,
    role: i.invited_role,
    teamId: i.team_id,
    applicationId: i.application_id,
    teamName: i.team_name,
    hackathonId: i.hackathon_id,
    teamMembersCount: i.team_members_count,
    teamMembersLimit: i.team_members_limit,
  }));
}

export function createInviteToDTO(invite: CreateInvite): CreateInviteDTO {
  return {
    invited_role: invite.role,
    application_id: invite.applicationId,
  };
}

export function updateInviteToDTO(payload: UpdateInvite): UpdateInviteDTO {
  return {
    status: payload.status,
  };
}
