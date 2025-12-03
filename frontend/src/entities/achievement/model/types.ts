export type AchievementPlace =
  | "participant"
  | "finalyst"
  | "thirdPlace"
  | "secondPlace"
  | "firstPlace";


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

export type AchievementCreate = Omit<Achievement, "id" | "hackathonName">;

export type AchievementCreateDTO = {
  hackathon_id: number;
  role: string;
  place: Achievement["place"];
};

export interface AchievementPatch {
  role?: string;
  place?: Achievement["place"];
  hackathonId?: number;
}

export interface AchievementPatch {
  role?: string;
  place?: Achievement["place"];
  hackathonId?: number;
}

export type EditAchievementArgs = {
  id: number;
  patch: AchievementPatch;
};