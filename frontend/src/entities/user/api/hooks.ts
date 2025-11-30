import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAuthUser,
  getUserById,
  editUserMainInfo,
} from "./users"; // путь поправь под себя

import type {
  User,
  UserMainInfoPatch,
} from "../model/types"; // см. ниже расширение типов


const userKeys = {
  all: ["user"] as const,
  me: ["user", "me"] as const,
  byId: (id: number) => ["user", id] as const,
};


export function useAuthUser() {
  return useQuery<User>({
    queryKey: userKeys.me,
    queryFn: getAuthUser,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUser(id: number, enabled = true) {
  return useQuery<User>({
    queryKey: userKeys.byId(id),
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
      // обновляем себя и, при желании, кеш других мест, где юзер используется
      queryClient.invalidateQueries({ queryKey: userKeys.me });
    },
  });
}