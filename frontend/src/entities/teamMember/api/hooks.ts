import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api/queryKeys";
import {
  getTeamMembers,
  addTeamMember,
  editTeamMember,
  deleteTeamMember,
  leaveTeam,
} from "./teamMembers";
import type {
  TeamMember,
  AddTeamMember,
  EditTeamMember,
} from "../model/types";

const teamKeys = queryKeys.teams;


export function useTeamMembers(teamId: number, enabled = true) {
  return useQuery<TeamMember[], Error>({
    queryKey: teamKeys.members(teamId),
    queryFn: () => getTeamMembers(teamId),
    staleTime: 60 * 1000,
    enabled,
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
    },
  });
}

export function useDeleteTeamMember(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => deleteTeamMember(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.members(teamId),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.byId(teamId),
      });
    },
  });
}

export function useLeaveTeam(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => leaveTeam(teamId),
    onSuccess: () => {
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
