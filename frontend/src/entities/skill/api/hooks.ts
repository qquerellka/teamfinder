import { useQuery } from "@tanstack/react-query";
import { getSkills } from "./skills";
import { Skill } from "../model/types";

export function useSkills() {
  return useQuery<Skill[]>({
    queryKey: ["skills"],
    queryFn: getSkills,
    staleTime: 5 * 60 * 1000,
  });
}
