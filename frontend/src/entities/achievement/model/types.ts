export type AchievementPlace =
  | "participant"
  | "finalyst"
  | "thirdPlace"
  | "secondPlace"
  | "firstPlace";

// ====== ДОМЕННЫЕ ТИПЫ (для фронта) ======

export interface Achievement {
  id: number;
  hackathonId: number;
  role: string;
  hackathonName: string | null; // <-- НОВОЕ ПОЛЕ
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
  hackathon_name: string | null; // <-- НОВОЕ ПОЛЕ
  place: AchievementPlace;
}

export interface AchievementsResponseDTO {
  offset: number;
  limit: number;
  total: number;
  items: AchievementDTO[];
}

// для создания ачивки
export type AchievementCreate = Omit<Achievement, "id" | "hackathonName">;

// для частичного редактирования ачивки
export interface AchievementPatch {
  role?: string;
  place?: Achievement["place"];
  hackathonId?: number;
}
