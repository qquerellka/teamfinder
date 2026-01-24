import { getSkills } from './skills';
import { Skill } from '../model/types';
import { queryKeys } from '@/shared/api/queryKeys';
import { useAppQuery } from '@/shared/api/useAppQuery';

export function useSkills() {
  return useAppQuery<Skill[]>({
    queryKey: queryKeys.skills.all,
    queryFn: getSkills,
    staleTime: 5 * 60 * 1000,
  });
}
