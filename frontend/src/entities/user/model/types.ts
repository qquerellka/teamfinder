import {
  Achievement,
  AchievementDTO,
} from "@/entities/achievement/model/types";
import { Skill, SkillDTO } from "@/entities/skill/model/types";

export interface User {
  id: number;
  telegramId: number;
  username: string | null;
  firstName: string | null;
  secondName: string | null;
  avatarUrl: string;
  bio?: string | null;
  city?: string | null;
  university?: string | null;
  link?: string | null;
  skills: Skill[];
  achievements: Achievement[];
}

export interface UserDTO {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string;
  bio?: string | null;
  city?: string | null;
  university?: string | null;
  link?: string | null;
  skills: SkillDTO[];
  achievements: AchievementDTO[];
}

// для PATCH /users/me
export interface UserMainInfoPatch {
  bio?: string;
  city?: string;
  university?: string;
  link?: string;
  skillSlugs?: string[]; // slugs для skills
}
