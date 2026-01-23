import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import {
  getTeamInvites,
  createTeamInvite,
  getApplicationInvites,
  getAllInvites,
  getInvite,
  updateInvite,
} from './invites';
import type { Invite, CreateInvite, UpdateInvite, MegaInvite } from '../model/types';
import { useAppQuery } from '@/shared/api/useAppQuery';

const inviteKeys = queryKeys.invites;

export function useTeamInvites(teamId: number) {
  return useAppQuery<Invite[], Error>({
    queryKey: inviteKeys.byTeam(teamId),
    queryFn: () => getTeamInvites(teamId),
    staleTime: 60 * 1000,
  });
}

export function useApplicationInvites(applicationId: number) {
  return useAppQuery<MegaInvite[], Error>({
    queryKey: inviteKeys.byApplication(applicationId),
    queryFn: () => getApplicationInvites(applicationId),
    staleTime: 60 * 1000,
  });
}

export function useMyInvites() {
  return useAppQuery<Invite[], Error>({
    queryKey: inviteKeys.me,
    queryFn: getAllInvites,
    staleTime: 60 * 1000,
  });
}

export function useInvite(id: number) {
  return useAppQuery<Invite, Error>({
    queryKey: inviteKeys.byId(id),
    queryFn: () => getInvite(id),
    staleTime: 60 * 1000,
  });
}

interface CreateInviteVariables {
  teamId: number;
  payload: CreateInvite;
}

export function useCreateInvite() {
  const queryClient = useQueryClient();

  return useMutation<Invite, Error, CreateInviteVariables>({
    mutationFn: ({ teamId, payload }) => createTeamInvite(teamId, payload),
    onSuccess: (data, variables) => {
      const { teamId } = variables;

      queryClient.invalidateQueries({
        queryKey: inviteKeys.byTeam(teamId),
      });

      if (data.applicationId) {
        queryClient.invalidateQueries({
          queryKey: inviteKeys.byApplication(data.applicationId),
        });
      }

      queryClient.invalidateQueries({
        queryKey: inviteKeys.me,
      });

      queryClient.invalidateQueries({
        queryKey: inviteKeys.byId(data.id),
      });
    },
  });
}

interface UpdateInviteVariables {
  id: number;
  payload: UpdateInvite;
}

export function useUpdateInvite() {
  const queryClient = useQueryClient();

  return useMutation<Invite, Error, UpdateInviteVariables>({
    mutationFn: ({ id, payload }) => updateInvite(id, payload),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: inviteKeys.byId(data.id),
      });

      if (data.teamId) {
        queryClient.invalidateQueries({
          queryKey: inviteKeys.byTeam(data.teamId),
        });
      }

      if (data.applicationId) {
        queryClient.invalidateQueries({
          queryKey: inviteKeys.byApplication(data.applicationId),
        });
      }

      queryClient.invalidateQueries({
        queryKey: inviteKeys.me,
      });
    },
  });
}
