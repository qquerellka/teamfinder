// src/entities/hackathon/api/hackathon-api.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";
import type { Hackathon } from "../model/types";

async function fetchHackathons(): Promise<Hackathon[]> {
  const { data } = await apiClient.get<Hackathon[]>("/hackathons");
  return data;
}

async function fetchHackathon(id: string): Promise<Hackathon> {
  const { data } = await apiClient.get<Hackathon>(`/hackathons/${id}`);
  return data;
}

export function useHackathonsQuery() {
  return useQuery({
    queryKey: ["hackathons"],
    queryFn: fetchHackathons,
  });
}

export function useHackathonQuery(id: string) {
  return useQuery({
    queryKey: ["hackathons", id],
    queryFn: () => fetchHackathon(id),
    enabled: Boolean(id),
  });
}
