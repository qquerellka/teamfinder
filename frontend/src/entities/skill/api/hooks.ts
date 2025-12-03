import { useQuery } from "@tanstack/react-query";
import { getSkills } from "./skills";
import { Skill } from "../model/types";
import { queryKeys } from "@/shared/api/queryKeys";

export function useSkills() {
  return useQuery<Skill[]>({
    queryKey: queryKeys.skills.all,
    queryFn: getSkills,
    staleTime: 5 * 60 * 1000,
  });
}
