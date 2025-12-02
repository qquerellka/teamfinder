import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthUser, getUserById, editUserMainInfo } from "./users";
import type { User, UserMainInfoPatch } from "../model/types";
import { queryKeys } from "@/shared/api/queryKeys";

export function useAuthUser() {
  return useQuery<User>({
    queryKey: queryKeys.user.me,
    queryFn: getAuthUser,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUser(id: number, enabled = true) {
  return useQuery<User>({
    queryKey: queryKeys.user.byId(id),
    queryFn: () => getUserById(id),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEditUserMainInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserMainInfoPatch) => editUserMainInfo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me });
    },
  });
}