import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Achievement, AchievementCreate, AchievementsList, EditAchievementArgs } from "../model/types";
import {
  createAchievement,
  deleteAchievement,
  editAchievement,
  getAuthUserAchievements,
  getUserAchievementsByUserId,
} from "./achievements";
import { queryKeys } from "@/shared/api/queryKeys";

const achievementKeys = queryKeys.achievements;
const userKeys = queryKeys.user;

export function useAuthUserAchievements() {
  return useQuery<AchievementsList>({
    queryKey: achievementKeys.me,
    queryFn: getAuthUserAchievements,
    staleTime: 60 * 1000,
  });
}

export function useUserAchievements(userId: number, enabled = true) {
  return useQuery<AchievementsList>({
    queryKey: achievementKeys.byUser(userId),
    queryFn: () => getUserAchievementsByUserId(userId),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useCreateAchievement() {
  const queryClient = useQueryClient();

  return useMutation<Achievement, Error, AchievementCreate>({
    mutationFn: (payload) => createAchievement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.me });
      queryClient.invalidateQueries({ queryKey: userKeys.me });
    },
  });
}

export function useDeleteAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAchievement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.me });
      queryClient.invalidateQueries({ queryKey: userKeys.me });
    },
  });
}

export function useEditAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: EditAchievementArgs) =>
      editAchievement(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.me });
      queryClient.invalidateQueries({ queryKey: userKeys.me });
    },
  });
}
