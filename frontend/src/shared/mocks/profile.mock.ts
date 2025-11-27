// src/shared/mocks/profile.mock.ts

import { Profile } from "../types/profile";
import { Skill } from "../types/skills";


// Пример скиллов
const skills: Skill[] = [
  Skill.JavaScript,
  Skill.React,
  Skill.NodeJS,
  Skill.Python,
  Skill.Docker,
  Skill.AWS,
];

// Пример профиля
export const mockProfile: Profile = {
  id: "12345",
  username: "qquerell",
  name: "Max",
  surname: "Uskov",
  bio: "Full-stack Developer passionate about coding, technology, and AI.",
  avatarUrl: "https://example.com/avatar.jpg",
  city: "Moscow",
  university: "Moscow Institute of Physics and Technology",
  link: "https://linkedin.com/in/qquerell",
  skills: skills,
};
