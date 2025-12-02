import { useQuery } from "@tanstack/react-query";
import { fetchHackathons, fetchHackathon } from "./hackathons";
import { queryKeys } from "@/shared/api/queryKeys";

export function useHackathonsQuery() {
  return useQuery({
    queryKey: queryKeys.hackathons.list,
    queryFn: fetchHackathons,
  });
}

export function useHackathonQuery(id: number) {
  return useQuery({
    queryKey: queryKeys.hackathons.byId(id),
    queryFn: () => fetchHackathon(id),
    enabled: Boolean(id),
  });
}
