import { apiClient } from "@/shared/api/client";
import {
  User,
  UserDTO,
} from "../model/types";
import { userToCamelCase } from "../lib/dto";

export async function getAuthUser(): Promise<User> {
  const { data } = await apiClient.get<UserDTO>("/users/me");
  return userToCamelCase(data);
}

export async function getUserById(id: number): Promise<User> {
  const { data } = await apiClient.get<UserDTO>(`/users/${id}`);
  return userToCamelCase(data);
}

export interface UserMainInfoPatch {
  bio?: string;
  city?: string;
  university?: string;
  link?: string;
  skillSlugs?: string[]; // список slug'ов
}

export async function editUserMainInfo(
  mainInfo: UserMainInfoPatch,
): Promise<void> {
  await apiClient.patch("/users/me", {
    bio: mainInfo.bio,
    city: mainInfo.city,
    university: mainInfo.university,
    link: mainInfo.link,
    skills: mainInfo.skillSlugs,
  });
}

