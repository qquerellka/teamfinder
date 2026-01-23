import { useHackathonsQuery } from '@/entities/hackathon';
import { useAuthUser } from '@/entities/user';
import { AchievementCreateForm } from '@/features/achievement/create';
import { AchievementEditForm } from '@/features/achievement/edit';
import { FC, useMemo } from 'react';

interface AchievementContainerProps {
  id: string | undefined;
  onDone?: () => void;
}

export const AchievementContainer: FC<AchievementContainerProps> = ({ id, onDone }) => {
  const isCreate = !id || id === 'new';

  const { data: user } = useAuthUser();
  const { data: hackathonsResponse } = useHackathonsQuery();

  const hackathons = hackathonsResponse?.items ?? [];
  const achievement = useMemo(() => {
    if (isCreate) return null;

    const achievementId = Number(id);
    if (!Number.isFinite(achievementId)) return null;

    return user?.achievements.find(a => a.id === achievementId) ?? null;
  }, [isCreate, id, user]);

  return (
    <>
      {isCreate ? (
        <AchievementCreateForm
          hackathons={hackathons.filter(h => h.status === 'closed')}
          onDone={onDone}
        />
      ) : (
        achievement && <AchievementEditForm achievement={achievement} onDone={onDone} />
      )}
    </>
  );
};
