export interface UserResponse {
    id: number;
    telegram_id: number;
    username: string;
    first_name: string;
    second_name: string;
    avatar_url: string;
    bio?: string;
    city?: string;
    university?: string;
    link: string;
    skills: Skill[];
    achievements: Achievement[];
}

export interface Skill {
  id: number;
  slug: string;
  skill: string;
}

export interface Achievement {
  id: number;
  hackathon_id: number;
  role: string;
  place: AchievementPlace;
}

export type AchievementPlace =
  | "participant"
  | "finalyst"
  | "thirdPlace"
  | "secondPlace"
  | "firstPlace";

export interface AuthResponse {
  access_token: string;
  profile: UserResponse;
}
