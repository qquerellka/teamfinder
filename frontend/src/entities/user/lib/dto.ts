import { Skill, SkillDTO } from "@/entities/skill";
import { User, UserDTO, UserEdit, UserEditDTO } from "../model/types";
import { achievementsToCamelCase } from "@/entities/achievement/lib/dto";

export function skillsToCamelCase(skills: SkillDTO[]): Skill[] {
  return skills.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
  }));
}

export function userToCamelCase(dto: UserDTO): User {
  return {
    id: dto.id,
    telegramId: dto.telegram_id,
    username: dto.username,
    firstName: dto.first_name,
    secondName: dto.last_name,
    avatarUrl: dto.avatar_url,
    bio: dto.bio ?? null,
    city: dto.city ?? null,
    university: dto.university ?? null,
    link: dto.link ?? null,
    skills: skillsToCamelCase(dto.skills),
    achievements: achievementsToCamelCase(dto.achievements),
  };
}

export function userEditToDTO(user: UserEdit): UserEditDTO {
  return {
    skills: user.skillSlugs,
    bio: user.bio,
    link: user.link,
    city: user.city,
    university: user.university,
  };
}
