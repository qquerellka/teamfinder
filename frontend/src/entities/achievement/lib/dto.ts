import {
  Achievement,
  AchievementDTO,
  AchievementCreate,
  AchievementCreateDTO,
  AchievementPatch,
  AchievementPatchDTO,
} from "../model/types";

export function achievementsToCamelCase(achs: AchievementDTO[]): Achievement[] {
  return achs.map((a) => ({
    id: a.id,
    hackathonId: a.hackathon_id,
    hackathonName: a.hackathon_name ?? null,
    role: a.role,
    place: a.place,
  }));
}

export function achievementCreateToDTO(
  payload: AchievementCreate
): AchievementCreateDTO {
  return {
    hackathon_id: payload.hackathonId,
    role: payload.role,
    place: payload.place,
  };
}

export function achievementEditToDTO(
  payload: AchievementPatch
): AchievementPatchDTO {
  return {
    hackathon_id: payload.hackathonId,
    role: payload.role,
    place: payload.place,
  };
}
