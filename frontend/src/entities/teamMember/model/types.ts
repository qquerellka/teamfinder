import { Role } from "@/shared/types/enums";


export interface TeamMemberDTO {
    user: {
        id: number,
        username: string,
        first_name: string,
        last_name: string,
    },
    role: Role,
    is_captain: boolean,
}

export interface TeamMember {
    user: {
        id: number,
        username: string,
        firstName: string,
        lastName: string,
    },
    role: Role,
    isCaptain: boolean,
}

export interface AddTeamMemberDTO {
    user_id: number,
    role: Role,
}

export interface AddTeamMember {
    userId: number,
    role: Role,
}

export interface EditTeamMemberDTO {
  role: Role,
  is_captain: boolean,
}

export interface EditTeamMember {
  role: Role,
  isCaptain: boolean,
}

