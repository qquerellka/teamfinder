import { apiClient } from '@/shared/api/client';
import { Achievement, AchievementCreate, AchievementDTO, AchievementPatch } from '../model/types';
import { achievementCreateToDTO, achievementsToCamelCase } from '../lib/dto';

export async function getAuthUserAchievements(): Promise<Achievement[]> {
  const { data } = await apiClient.get<AchievementDTO[]>('/users/me/achievements');
  return achievementsToCamelCase(data);
}

export async function getUserAchievementsByUserId(id: number): Promise<Achievement[]> {
  const { data } = await apiClient.get<AchievementDTO[]>(`/users/${id}/achievements`);
  return achievementsToCamelCase(data);
}

export async function createAchievement(ach: AchievementCreate): Promise<Achievement> {
  const payload = achievementCreateToDTO(ach);
  const { data } = await apiClient.post<AchievementDTO>('/users/me/achievements', payload);
  return achievementsToCamelCase([data])[0];
}

export async function deleteAchievement(id: number): Promise<void> {
  await apiClient.delete(`/achievements/${id}`);
}

export async function editAchievement(id: number, patch: AchievementPatch): Promise<void> {
  await apiClient.patch(`/achievements/${id}`, {
    role: patch.role,
    place: patch.place,
    hackathon_id: patch.hackathonId,
  });
}
