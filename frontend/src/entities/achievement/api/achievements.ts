// ====== ACHIEVEMENTS ======

import { apiClient } from "@/shared/api/client";
import { Achievement, AchievementDTO, AchievementsList, AchievementsResponseDTO } from "../model/types";
import { achievementsToCamelCase } from "../lib/dto";

export async function getAuthUserAchievements(): Promise<AchievementsList> {
  const { data } =
    await apiClient.get<AchievementsResponseDTO>("/users/me/achievements");

  return {
    offset: data.offset,
    limit: data.limit,
    items: achievementsToCamelCase(data.items),
  };
}

export async function getUserAchievementsByUserId(
  id: number,
): Promise<AchievementsList> {
  const { data } = await apiClient.get<AchievementsResponseDTO>(
    `/users/${id}/achievements`,
  );

  return {
    offset: data.offset,
    limit: data.limit,
    items: achievementsToCamelCase(data.items),
  };
}

export type AchievementCreate = Omit<Achievement, "id">;

export async function createAchievement(
  ach: AchievementCreate,
): Promise<Achievement> {
  const { data } = await apiClient.post<AchievementDTO>("/users/me/achievements", {
    hackathon_id: ach.hackathonId,
    role: ach.role,
    place: ach.place,
  });

  return achievementsToCamelCase([data])[0];
}


export async function deleteAchievement(id: number): Promise<void> {
  await apiClient.delete(`/achievements/${id}`);
}

export interface AchievementPatch {
  role?: string;
  place?: Achievement["place"];
  hackathonId?: number;
}

export async function editAchievement(
  id: number,
  patch: AchievementPatch,
): Promise<void> {
  await apiClient.patch(`/achievements/${id}`, {
    role: patch.role,
    place: patch.place,
    hackathon_id: patch.hackathonId,
  });
}
