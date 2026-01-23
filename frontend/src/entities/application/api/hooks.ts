import { queryKeys } from '@/shared/api/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createHackathonApplication,
  deleteAuthUserApplication,
  editAuthUserApplication,
  getAuthUserApplication,
  getAuthUserApplicationOnHackathon,
  getAuthUserApplications,
  getHackathonApplications,
} from './aplications';
import {
  Application,
  ApplicationCreate,
  ApplicationEdit,
  ApplicationsResponse,
} from '../model/types';
import { useAppQuery } from '@/shared/api/useAppQuery';

const applicationKeys = queryKeys.applications;

export function useHackathonApplications(id: number) {
  return useAppQuery<ApplicationsResponse>({
    queryKey: applicationKeys.byHackathon(id),
    queryFn: () => getHackathonApplications(id),
    staleTime: 60 * 1000,
  });
}

export function useAuthUserApplicationsOnHackathon(id: number) {
  return useAppQuery<Application | null>({
    queryKey: applicationKeys.meByHackathon(id),
    queryFn: () => getAuthUserApplicationOnHackathon(id),
    staleTime: 60 * 1000,
  });
}

export function useAuthUserApplications() {
  return useAppQuery<Application[]>({
    queryKey: applicationKeys.me,
    queryFn: getAuthUserApplications,
    staleTime: 60 * 1000,
  });
}

export function useCreateHackathonApplication(hackathonId: number) {
  const queryClient = useQueryClient();

  return useMutation<Application, Error, ApplicationCreate>({
    mutationFn: payload => createHackathonApplication(hackathonId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: applicationKeys.byHackathon(hackathonId),
      });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.me,
      });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.meByHackathon(hackathonId),
      });
    },
  });
}

export function useAuthUserApplication(id: number) {
  return useAppQuery<Application>({
    queryKey: applicationKeys.byId(id),
    queryFn: () => getAuthUserApplication(id),
    staleTime: 60 * 1000,
  });
}

export function useEditAuthUserApplication() {
  const queryClient = useQueryClient();

  return useMutation<Application, Error, { id: number; payload: ApplicationEdit }>({
    mutationFn: ({ id, payload }) => editAuthUserApplication(id, payload),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: applicationKeys.byId(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.me,
      });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.byHackathon(data.hackathonId),
      });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.meByHackathon(data.hackathonId),
      });
    },
  });
}

export function useDeleteAuthUserApplication() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: number; hackathonId: number }>({
    mutationFn: ({ id }) => deleteAuthUserApplication(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: applicationKeys.byId(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.me,
      });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.byHackathon(variables.hackathonId),
      });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.meByHackathon(variables.hackathonId),
      });
    },
  });
}
