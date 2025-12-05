import { apiClient } from "@/shared/api/client";
import { Skill } from "../model/types";

export async function getSkills(): Promise<Skill[]> {
  const { data } = await apiClient.get<Skill[]>("/skills");
  return data;
}
