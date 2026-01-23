import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import {
  teamVacancies,
  createVacancy,
  getAllVacancies,
  getVacancy,
  editVacancy,
  deleteVacancy,
  hackathonVacancies,
} from './vacancies';
import type { Vacancy, EditVacancy, CreateVacancy } from '../model/types';
import { useAppQuery } from '@/shared/api/useAppQuery';

const vacancyKeys = queryKeys.vacancies;

export function useTeamVacancies(teamId: number) {
  return useAppQuery<Vacancy[], Error>({
    queryKey: vacancyKeys.byTeam(teamId),
    queryFn: () => teamVacancies(teamId),
    staleTime: 60 * 1000,
  });
}

export function useHackathonVacancies(hackathonId: number) {
  return useAppQuery<Vacancy[], Error>({
    queryKey: vacancyKeys.byHackathon(hackathonId),
    queryFn: () => hackathonVacancies(hackathonId),
    staleTime: 60 * 1000,
  });
}

export function useAllVacancies() {
  return useAppQuery<Vacancy[], Error>({
    queryKey: vacancyKeys.all,
    queryFn: getAllVacancies,
    staleTime: 60 * 1000,
  });
}

export function useVacancy(id: number) {
  return useAppQuery<Vacancy, Error>({
    queryKey: vacancyKeys.byId(id),
    queryFn: () => getVacancy(id),
    staleTime: 60 * 1000,
  });
}

export function useCreateVacancy(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation<Vacancy, Error, CreateVacancy>({
    mutationFn: (payload: CreateVacancy) => createVacancy(teamId, payload),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: vacancyKeys.byTeam(teamId),
      });

      queryClient.invalidateQueries({
        queryKey: vacancyKeys.byId(data.id),
      });

      queryClient.invalidateQueries({
        queryKey: vacancyKeys.all,
      });
    },
  });
}

type EditVacancyVariables = {
  id: number;
  payload: EditVacancy;
};

export function useEditVacancy() {
  const queryClient = useQueryClient();

  return useMutation<Vacancy, Error, EditVacancyVariables>({
    mutationFn: ({ id, payload }) => editVacancy(payload, id),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: vacancyKeys.byId(data.id),
      });

      queryClient.invalidateQueries({
        queryKey: vacancyKeys.byTeam(data.teamId),
      });

      queryClient.invalidateQueries({
        queryKey: vacancyKeys.all,
      });
    },
  });
}

export function useDeleteVacancy() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: number; teamId?: number }>({
    mutationFn: ({ id }) => deleteVacancy(id),
    onSuccess: (_data, variables) => {
      const { id, teamId } = variables;

      queryClient.invalidateQueries({
        queryKey: vacancyKeys.byId(id),
      });

      if (teamId) {
        queryClient.invalidateQueries({
          queryKey: vacancyKeys.byTeam(teamId),
        });
      }

      queryClient.invalidateQueries({
        queryKey: vacancyKeys.all,
      });
    },
  });
}
