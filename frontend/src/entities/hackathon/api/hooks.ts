import { useQuery } from "@tanstack/react-query";
import { fetchHackathons, fetchHackathon, FetchHackathonsParams } from "./hackathons";
import { queryKeys } from "@/shared/api/queryKeys";

export function useHackathonsQuery(params: FetchHackathonsParams = {}) {
  const { q } = params;

  return useQuery({
    queryKey: [...queryKeys.hackathons.list, q ?? ""],
    queryFn: () => fetchHackathons(params),
    staleTime: 60_000,
  });
}

export function useHackathonQuery(id: number) {
  return useQuery({
    queryKey: queryKeys.hackathons.byId(id),
    queryFn: () => fetchHackathon(id),
    enabled: Boolean(id),
  });
}
