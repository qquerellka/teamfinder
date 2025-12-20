import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api/queryKeys";
import {
  getTeamMembers,
  addTeamMember,
  editTeamMember,
  deleteTeamMember,
  leaveTeam,
} from "./teamMembers";
import type { TeamMember, AddTeamMember, EditTeamMember } from "../model/types";
import { useAppQuery } from "@/shared/api/useAppQuery";

const teamKeys = queryKeys.teams;

export function useTeamMembers(teamId: number) {
  return useAppQuery<TeamMember[], Error>({
    queryKey: teamKeys.members(teamId),
    queryFn: () => getTeamMembers(teamId),
    staleTime: 60 * 1000,
  });
}

export function useAddTeamMember(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation<TeamMember, Error, AddTeamMember>({
    mutationFn: (payload) => addTeamMember(teamId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.members(teamId),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.byId(teamId),
      });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

// Обновить участника (его роль / капитанство)
// здесь предполагается, что на бэке PATCH /teams/{id}/members
// меняет "текущего" участника или того, кто зашит в payload
export function useEditTeamMember(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation<TeamMember, Error, EditTeamMember>({
    mutationFn: (payload) => editTeamMember(teamId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.members(teamId),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.byId(teamId),
      });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useDeleteTeamMember(teamId: number, userId: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => deleteTeamMember(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.members(teamId),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.byId(teamId),
      });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useLeaveTeam(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => leaveTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });

      queryClient.invalidateQueries({
        queryKey: teamKeys.members(teamId),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.byId(teamId),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.me,
      });
    },
  });
}
