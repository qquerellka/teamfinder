import { apiClient } from "@/shared/api/client";
import { Hackathon, HackathonDTO } from "../model/types";
import { hackathonsToCamelCase } from "../lib/dto";

interface FetchHackathonsApiResponse {
  items: HackathonDTO[];
  limit: number;
  offset: number;
}

export interface FetchHackathonsResponse {
  items: Hackathon[];
  limit: number;
  offset: number;
}

export interface FetchHackathonsParams {
  q?: string;
  limit?: number;
  offset?: number;
}

export async function fetchHackathons(
  params: FetchHackathonsParams = {}
): Promise<FetchHackathonsResponse> {
  const { data } = await apiClient.get<FetchHackathonsApiResponse>(
    "/hackathons",
    { params }
  );

  return {
    limit: data.limit,
    offset: data.offset,
    items: hackathonsToCamelCase(data.items),
  };
}

export async function fetchHackathon(id: number): Promise<Hackathon> {
  const { data } = await apiClient.get<HackathonDTO>(`/hackathons/${id}`);
  return hackathonsToCamelCase([data])[0];
}
