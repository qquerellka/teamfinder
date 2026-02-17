import { Achievement, AchievementDTO } from '@/entities/achievement';
import { Skill, SkillDTO } from '@/entities/skill';

export interface User {
  id: number;
  telegramId: number;
  username: string;
  firstName: string;
  lastName: string;
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
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  bio?: string | null;
  city?: string | null;
  university?: string | null;
  link?: string | null;
  skills: SkillDTO[];
  achievements: AchievementDTO[];
}

export interface UserEdit {
  bio?: string;
  city?: string;
  university?: string;
  link?: string;
  skillSlugs?: string[];
}

export interface UserEditDTO {
  bio?: string;
  city?: string;
  university?: string;
  link?: string;
  skills?: string[];
}
