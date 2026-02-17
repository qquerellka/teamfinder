import { fetchHackathons, fetchHackathon, FetchHackathonsParams } from './hackathons';
import { queryKeys } from '@/shared/api/queryKeys';
import { useAppQuery } from '@/shared/api/useAppQuery';

export function useHackathonsQuery(params: FetchHackathonsParams = {}) {
  return useAppQuery({
    queryKey: [...queryKeys.hackathons.list, params],
    queryFn: () => fetchHackathons(params),
    staleTime: 60_000,
  });
}

export function useHackathonQuery(id: number) {
  return useAppQuery({
    queryKey: queryKeys.hackathons.byId(id),
    queryFn: () => fetchHackathon(id),
  });
}
