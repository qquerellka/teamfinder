import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AchievementsList } from "../model/types";
import { AchievementCreate, createAchievement, deleteAchievement, getAuthUserAchievements, getUserAchievementsByUserId } from "./achievements";

const achievementKeys = {
  all: ["achievements"] as const,
  me: ["achievements", "me"] as const,
  byUser: (id: number) => ["achievements", "user", id] as const,
};

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

  return useMutation({
    mutationFn: (payload: AchievementCreate) => createAchievement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.me });
      // если ачивки где-то ещё показываются, можно дополнительно инвалидировать по userId
    },
  });
}

export function useDeleteAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAchievement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.me });
    },
  });
}
