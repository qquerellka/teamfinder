import { AddTeamMember, AddTeamMemberDTO, EditTeamMember, EditTeamMemberDTO, TeamMember, TeamMemberDTO } from "../model/types";



export function teamMembersToCamelCase(
  teamMembers: TeamMemberDTO[],
): TeamMember[] {
  return teamMembers.map((t) => ({
    user: {
      id: t.user.id,
      username: t.user.username,
      firstName: t.user.first_name,
      lastName: t.user.last_name,
    },
    role: t.role,
    isCaptain: t.is_captain,
  }));
}

export function addTeamMemberToDTO(
  member: AddTeamMember,
): AddTeamMemberDTO {
  return {
    user_id: member.userId,
    role: member.role,
  };
}

export function editTeamMemberToDTO(
  member: EditTeamMember,
): EditTeamMemberDTO {
  return {
    role: member.role,
    is_captain: member.isCaptain,
  };
}