import { useDeleteAchievement } from '@/entities/achievement';

export function useAchievementDelete(params?: { onDone?: () => void }) {
  const m = useDeleteAchievement();

  const remove = (id: number) => m.mutate(id, { onSuccess: () => params?.onDone?.() });

  return { remove, isDeleting: m.isPending };
}
