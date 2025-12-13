import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthUser, getUserById, editUserMainInfo } from "./users";
import type { User, UserEdit } from "../model/types";
import { queryKeys } from "@/shared/api/queryKeys";
import { useAppQuery } from "@/shared/api/useAppQuery";

export function useAuthUser() {
  return useAppQuery<User>({
    queryKey: queryKeys.user.me,
    queryFn: getAuthUser,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUser(id: number) {
  return useAppQuery<User>({
    queryKey: queryKeys.user.byId(id),
    queryFn: () => getUserById(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEditUserMainInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserEdit) => editUserMainInfo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me });
    },
  });
}
