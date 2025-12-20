import {
  CreateTeam,
  CreateTeamDTO,
  EditTeam,
  EditTeamDTO,
  MyTeam,
  MyTeamDTO,
  Team,
  TeamDTO,
  TeamsDTOResponse,
  TeamsResponse,
  TeamWithMembers,
  TeamWithMembersDTO,
} from "../model/types";

export function teamsToCamelCase(teamsDTO: TeamDTO[]): Team[] {
  return teamsDTO.map((t) => ({
    id: t.id,
    hackathonId: t.hackathon_id,
    name: t.name,
    description: t.description,
    captainId: t.captain_id,
    status: t.status,
  }));
}
export function editTeamToDTO(team: EditTeam): EditTeamDTO {
  return {
    name: team.name,
    description: team.description,
    status: team.status,
  };
}
export function teamsResponseToCamelCase(
  response: TeamsDTOResponse
): TeamsResponse {
  return {
    offset: response.offset,
    limit: response.limit,
    items: teamsToCamelCase(response.items),
  };
}
export function createTeamToDTO(payload: CreateTeam): CreateTeamDTO {
  return {
    role: payload.role,
    description: payload.description,
    name: payload.name,
  };
}

export function teamWithMembersToCamelCase(
  payload: TeamWithMembersDTO
): TeamWithMembers {
  return {
    id: payload.id,
    hackathonId: payload.hackathon_id,
    name: payload.name,
    description: payload.description,
    captainId: payload.captain_id,
    status: payload.status,
    members: payload.members?.map((m) => ({
      user: {
        id: m.user.id,
        username: m.user.username,
        firstName: m.user.first_name,
        lastName: m.user.last_name,
        avatarUrl: m.user.avatar_url,
      },
      role: m.role,
      isCaptain: m.is_captain,
    })),
  };
}

export function myTeamsToCamelCase(teamsDTO: MyTeamDTO[]): MyTeam[] {
  return teamsDTO.map((t) => ({
    id: t.id,
    hackathonId: t.hackathon_id,
    name: t.name,
    description: t.description,
    captainId: t.captain_id,
    status: t.status,
    hackathonName: t.hackathon_name,
    isCaptain: t.is_captain,
    teamMembersCount: t.team_members_count,
    teamMembersLimit: t.team_members_limit,
    countInvites: t.count_invites
  }));
}
