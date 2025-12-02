import { Achievement, AchievementDTO } from "../model/types";

export function achievementsToCamelCase(achs: AchievementDTO[]): Achievement[] {
  return achs.map((a) => ({
    id: a.id,
    hackathonId: a.hackathon_id,
    hackathonName: a.hackathon_name ?? null, // <-- ДОБАВИЛИ
    role: a.role,
    place: a.place,
  }));
}