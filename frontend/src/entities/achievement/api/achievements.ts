import { apiClient } from "@/shared/api/client";
import { Achievement, AchievementCreate, AchievementDTO, AchievementPatch, AchievementsList, AchievementsResponseDTO } from "../model/types";
import { achievementCreateToDTO, achievementsToCamelCase } from "../lib/dto";

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


export async function createAchievement(
  ach: AchievementCreate,
): Promise<Achievement> {
  const payload = achievementCreateToDTO(ach);

  const { data } = await apiClient.post<AchievementDTO>(
    "/users/me/achievements",
    payload,
  );
  
  return achievementsToCamelCase([data])[0];
}

export async function deleteAchievement(id: number): Promise<void> {
  await apiClient.delete(`/achievements/${id}`);
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

