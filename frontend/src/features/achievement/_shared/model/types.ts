import type { AchievementPlace } from '@/entities/achievement';
import type { Role } from '@/shared/types/enums';

export type AchievementFormValues = {
  hackathonId: number | null;
  role: Role | '';
  place: AchievementPlace | '';
};

export type AchievementFormField = keyof AchievementFormValues;
