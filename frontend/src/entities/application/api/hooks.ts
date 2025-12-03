import { queryKeys } from "@/shared/api/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createHackathonApplication,
  deleteAuthUserApplication,
  editAuthUserApplication,
  getAuthUserApplication,
  getAuthUserApplicationOnHackathon,
  getAuthUserApplications,
  getHackathonApplications,
} from "./applications";
import {
  Application,
  ApplicationCreate,
  ApplicationEdit,
  ApplicationsResponse,
} from "../model/types";

const applicationKeys = queryKeys.applications;

export function useHackathonApplications(id: number, enabled = true) {
  return useQuery<ApplicationsResponse>({
    queryKey: applicationKeys.byHackathon(id),
    queryFn: () => getHackathonApplications(id),
    staleTime: 60 * 1000,
    enabled,
  });
}

export function useAuthUserApplicationsOnHackathon(id: number, enabled = true) {
  return useQuery<Application>({
    queryKey: applicationKeys.meByHackathon(id),
    queryFn: () => getAuthUserApplicationOnHackathon(id),
    staleTime: 60 * 1000,
    enabled,
  });
}

export function useAuthUserApplications(enabled = true) {
  return useQuery({
    queryKey: applicationKeys.me,
    queryFn: getAuthUserApplications,
    staleTime: 60 * 1000,
    enabled,
  });
}

export function useCreateHackathonApplication(hackathonId: number) {
  const queryClient = useQueryClient();

  return useMutation<Application, Error, ApplicationCreate>({
    mutationFn: (payload) => createHackathonApplication(hackathonId, payload),
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

export function useAuthUserApplication(id: number, enabled = true) {
  return useQuery<Application>({
    queryKey: applicationKeys.byId(id),
    queryFn: () => getAuthUserApplication(id),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useEditAuthUserApplication() {
  const queryClient = useQueryClient();

  return useMutation<
    Application,
    Error,
    { id: number; payload: ApplicationEdit }
  >({
    mutationFn: ({ id, payload }) => editAuthUserApplication(id, payload),
    onSuccess: (data) => {
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