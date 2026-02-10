import { apiClient } from '@/shared/api/client';
import { Hackathon, HackathonDTO } from '../model/types';
import { hackathonsToCamelCase } from '../lib/dto';
import { HackathonMode } from '@/shared/types/enums';

interface HackathonsResponseDTO {
  items: HackathonDTO[];
  limit: number;
  offset: number;
}

export interface HackathonsResponse {
  items: Hackathon[];
  limit: number;
  offset: number;
}

export interface FetchHackathonsParams {
  q?: string;
  limit?: number;
  offset?: number;
  mode?: HackathonMode;
  prize_fund?: boolean;
}

export async function fetchHackathons(
  params: FetchHackathonsParams = {},
): Promise<HackathonsResponse> {
  const { data } = await apiClient.get<HackathonsResponseDTO>('/hackathons', { params });

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
