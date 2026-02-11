import { useDeleteAchievement } from '@/entities/achievement';

export function useAchievementDelete(params?: { onDone?: () => void }) {
  const { mutate, isPending } = useDeleteAchievement();

  const remove = (id: number) => mutate(id, { onSuccess: () => params?.onDone?.() });

  return { remove, isDeleting: isPending };
}
