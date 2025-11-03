import { Skill } from "./skills";

export interface Profile {
  id: string;
  username: string;
  name: string;
  surname: string;
  bio: string;

  avatarUrl: string;
  city: string;
  university: string;
  link: string;

  skills: Skill[];
}
