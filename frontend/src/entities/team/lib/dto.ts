import {
  CreateTeam,
  CreateTeamDTO,
  EditTeam,
  EditTeamDTO,
  Team,
  TeamDTO,
  TeamsDTOResponse,
  TeamsResponse,
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
