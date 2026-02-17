import { Role } from '@/shared/types/enums';

export type AchievementPlace =
  | 'participant'
  | 'finalyst'
  | 'thirdPlace'
  | 'secondPlace'
  | 'firstPlace';

export interface AchievementDTO {
  id: number;
  hackathon_id: number;
  role: Role;
  hackathon_name: string;
  place: AchievementPlace;
}

export interface Achievement {
  id: number;
  hackathonId: number;
  role: Role;
  hackathonName: string;
  place: AchievementPlace;
}

export interface AchievementCreateDTO {
  hackathon_id: number;
  role: Role;
  place: AchievementPlace;
}

export interface AchievementCreate {
  hackathonId: number;
  role: Role;
  place: AchievementPlace;
}

export type AchievementPatchDTO = {
  hackathon_id?: number;
  role?: Role;
  place?: AchievementPlace;
};

export interface AchievementPatch {
  role?: Role;
  place?: AchievementPlace;
  hackathonId?: number;
}

export interface EditAchievementArgs {
  id: number;
  patch: AchievementPatch;
}

export const placeOptions: { label: string; value: AchievementPlace }[] = [
  { label: '1 место', value: 'firstPlace' },
  { label: '2 место', value: 'secondPlace' },
  { label: '3 место', value: 'thirdPlace' },
  { label: 'Участник', value: 'participant' },
  { label: 'Финалист', value: 'finalyst' },
];
