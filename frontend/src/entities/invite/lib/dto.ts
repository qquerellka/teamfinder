import {
  CreateInvite,
  CreateInviteDTO,
  Invite,
  InviteDTO,
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
    teamName: i.team_name
  }));
}

export function createInviteToDTO(invite: CreateInvite): CreateInviteDTO {
  return {
    role: invite.role,
    application_id: invite.applicationId,
  };
}

export function updateInviteToDTO(payload: UpdateInvite): UpdateInviteDTO {
    return {
        status: payload.status
    }
}
