import { apiClient } from "@/shared/api/client";
import { mapHackathon } from "@/shared/helpers/mapping";
import { Hackathon, HackathonApi } from "../model/types";

interface FetchHackathonsApiResponse {
  items: HackathonApi[];
  limit: number;
  offset: number;
}

export interface FetchHackathonsResponse {
  items: Hackathon[];
  limit: number;
  offset: number;
}

export async function fetchHackathons(): Promise<FetchHackathonsResponse> {
  const { data } = await apiClient.get<FetchHackathonsApiResponse>("/hackathons");

  return {
    limit: data.limit,
    offset: data.offset,
    items: data.items.map(mapHackathon),
  };
}

export async function fetchHackathon(id: number): Promise<Hackathon> {
  const { data } = await apiClient.get<HackathonApi>(`/hackathons/${id}`);
  return mapHackathon(data);
}