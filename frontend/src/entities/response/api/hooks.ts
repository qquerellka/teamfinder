import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import {
  getVacancyResponses,
  createVacancyResponse,
  getResponse,
  updateResponse,
  deleteResponse,
  getAllResponses,
  getAllTeamResponses,
} from './responses';
import type { Response, UpdateResponse } from '../model/types';
import { useAppQuery } from '@/shared/api/useAppQuery';

const responseKeys = queryKeys.responses;

export function useVacancyResponses(vacancyId: number) {
  return useAppQuery<Response[], Error>({
    queryKey: responseKeys.byVacancy(vacancyId),
    queryFn: () => getVacancyResponses(vacancyId),
    staleTime: 60 * 1000,
  });
}

export function useMyResponses() {
  return useAppQuery<Response[], Error>({
    queryKey: responseKeys.me,
    queryFn: getAllResponses,
    staleTime: 60 * 1000,
  });
}

export function useTeamResponses(teamId: number) {
  return useAppQuery<Response[], Error>({
    queryKey: responseKeys.me,
    queryFn: () => getAllTeamResponses(teamId),
    staleTime: 60 * 1000,
  });
}

export function useResponse(id: number) {
  return useAppQuery<Response, Error>({
    queryKey: responseKeys.byId(id),
    queryFn: () => getResponse(id),
    staleTime: 60 * 1000,
  });
}

interface CreateResponseVariables {
  vacancyId: number;
}

export function useCreateResponse() {
  const queryClient = useQueryClient();

  return useMutation<Response, Error, CreateResponseVariables>({
    mutationFn: ({ vacancyId }) => createVacancyResponse(vacancyId),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: responseKeys.byVacancy(data.vacancyId),
      });

      queryClient.invalidateQueries({
        queryKey: responseKeys.byId(data.id),
      });

      queryClient.invalidateQueries({
        queryKey: responseKeys.me,
      });
    },
  });
}

interface UpdateResponseVariables {
  id: number;
  payload: UpdateResponse;
}

export function useUpdateResponse() {
  const queryClient = useQueryClient();

  return useMutation<Response, Error, UpdateResponseVariables>({
    mutationFn: ({ id, payload }) => updateResponse(id, payload),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: responseKeys.byId(data.id),
      });

      queryClient.invalidateQueries({
        queryKey: responseKeys.byVacancy(data.vacancyId),
      });

      if (data.teamId && data.status === 'accepted') {
        // Инвалидируем членов команды
        queryClient.invalidateQueries({
          queryKey: ['teams', data.teamId, 'members'],
        });

        // Также инвалидируем саму команду
        queryClient.invalidateQueries({
          queryKey: ['teams', data.teamId],
        });

        // Инвалидируем vacancies этой команды
        queryClient.invalidateQueries({
          queryKey: ['vacancies', 'team', data.teamId],
        });
      }

      queryClient.invalidateQueries({
        queryKey: responseKeys.me,
      });
    },
  });
}

interface DeleteResponseVariables {
  id: number;
  vacancyId?: number;
}

export function useDeleteResponse() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteResponseVariables>({
    mutationFn: ({ id }) => deleteResponse(id),
    onSuccess: (_data, variables) => {
      const { id, vacancyId } = variables;

      queryClient.invalidateQueries({
        queryKey: responseKeys.byId(id),
      });

      if (vacancyId) {
        queryClient.invalidateQueries({
          queryKey: responseKeys.byVacancy(vacancyId),
        });
      }

      queryClient.invalidateQueries({
        queryKey: responseKeys.me,
      });
    },
  });
}
