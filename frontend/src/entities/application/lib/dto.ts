import { Role } from "@/shared/types/enums";
import { Application, ApplicationCreate, ApplicationCreateDTO, ApplicationDTO, ApplicationEdit, ApplicationEditDTO } from "../model/types";

export function applicationsToCamelCase(
  applications: ApplicationDTO[]
): Application[] {
  return applications.map((a) => ({
    id: a.id,
    hackathonId: a.hackathon_id,
    userId: a.user_id,
    role: a.role as Role,
    username: a.username,
    firstName: a.first_name,
    lastName: a.last_name,
    skills: a.skills,
    registrationEndDate: a.registration_end_date,
  }));
}

export function applicationCreateToDTO(payload: ApplicationCreate): ApplicationCreateDTO {
    return {
        role: payload.role,
    }
}
export function applicationEditToDTO(payload: ApplicationEdit): ApplicationEditDTO {
    return {
        role: payload.role,
    }
}

// export function achievementCreateToDTO(
//   payload: AchievementCreate
// ): AchievementCreateDTO {
//   return {
//     hackathon_id: payload.hackathonId,
//     role: payload.role,
//     place: payload.place,
//   };
// }
