import { Role } from "@/shared/types/enums";

export type InviteStatus = 'pending' | 'accepted' | 'rejected' | 'expired'

export interface Invite {
    id: number,
    status: InviteStatus,
    role: Role,
    teamId: number,
    applicationId: number,
    userId?: number,
    username?: number,
    teamName?: string,
}

export interface InviteDTO {
    id: number,
    status: InviteStatus,
    invited_role: Role,
    team_id: number,
    application_id: number,
    application_user_id?: number,
    user_name?: number,
    team_name?: string
}

export interface CreateInvite {
    role: Role,
    applicationId: number,
}

export interface CreateInviteDTO {
    role: Role,
    application_id: number,
}

export interface UpdateInvite {
    status: InviteStatus,
}

export interface UpdateInviteDTO {
    status: InviteStatus,
}