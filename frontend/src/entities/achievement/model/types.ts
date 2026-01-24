export type AchievementPlace =
  | 'participant'
  | 'finalyst'
  | 'thirdPlace'
  | 'secondPlace'
  | 'firstPlace';

export interface Achievement {
  id: number;
  hackathonId: number;
  role: string;
  hackathonName: string;
  place: AchievementPlace;
}

export interface AchievementsList {
  offset: number;
  limit: number;
  items: Achievement[];
}

export interface AchievementDTO {
  id: number;
  hackathon_id: number;
  role: string;
  hackathon_name: string;
  place: AchievementPlace;
}

export interface AchievementsResponseDTO {
  offset: number;
  limit: number;
  total: number;
  items: AchievementDTO[];
}

export type AchievementCreate = {
  hackathonId: number;
  role: string;
  place: AchievementPlace;
};

export type AchievementCreateDTO = {
  hackathon_id: number;
  role: string;
  place: AchievementPlace;
};

export interface AchievementPatch {
  role?: string;
  place?: AchievementPlace;
  hackathonId?: number;
}
export type AchievementPatchDTO = {
  hackathon_id?: number;
  role?: string;
  place?: AchievementPlace;
};

export type EditAchievementArgs = {
  id: number;
  patch: AchievementPatch;
};

export const placeOptions: { label: string; value: AchievementPlace }[] = [
  { label: '1 место', value: 'firstPlace' },
  { label: '2 место', value: 'secondPlace' },
  { label: '3 место', value: 'thirdPlace' },
  { label: 'Участник', value: 'participant' },
  { label: 'Финалист', value: 'finalyst' },
];
