import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api/queryKeys";
import {
  getHackathonTeams,
  getMyTeams,
  getMyTeamOnHackathon,
  getTeam,
  createTeam,
  editTeam,
  deleteTeam,
} from "./teams";
import {
  Team,
  TeamsResponse,
  CreateTeam,
  EditTeam,
} from "../model/types";
import { useAppQuery } from "@/shared/api/useAppQuery";

const teamKeys = queryKeys.teams;

export function useHackathonTeams(hackathonId: number) {
  return useAppQuery<TeamsResponse, Error>({
    queryKey: teamKeys.byHackathon(hackathonId),
    queryFn: () => getHackathonTeams(hackathonId),
    staleTime: 60 * 1000,
  });
}

export function useMyTeams() {
  return useAppQuery<TeamsResponse, Error>({
    queryKey: teamKeys.me,
    queryFn: getMyTeams,
    staleTime: 60 * 1000,
  });
}

export function useMyTeamOnHackathon(hackathonId: number) {
  return useAppQuery<Team, Error>({
    queryKey: teamKeys.meByHackathon(hackathonId),
    queryFn: () => getMyTeamOnHackathon(hackathonId),
    staleTime: 60 * 1000,
  });
}

export function useTeam(teamId: number) {
  return useAppQuery<Team, Error>({
    queryKey: teamKeys.byId(teamId),
    queryFn: () => getTeam(teamId),
    staleTime: 60 * 1000,
  });
}

export function useCreateTeam(hackathonId: number) {
  const queryClient = useQueryClient();

  return useMutation<Team, Error, CreateTeam>({
    mutationFn: (payload) => createTeam(payload, hackathonId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.byHackathon(hackathonId),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.me,
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.meByHackathon(hackathonId),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.byId(data.id),
      });
    },
  });
}

type EditTeamVariables = {
  id: number;
  payload: EditTeam;
};

export function useEditTeam() {
  const queryClient = useQueryClient();

  return useMutation<Team, Error, EditTeamVariables>({
    mutationFn: ({ id, payload }) => editTeam(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.byId(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.byHackathon(data.hackathonId),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.me,
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.meByHackathon(data.hackathonId),
      });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: number; hackathonId: number }>({
    mutationFn: ({ id }) => deleteTeam(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.byId(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.byHackathon(variables.hackathonId),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.me,
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.meByHackathon(variables.hackathonId),
      });
    },
  });
}
