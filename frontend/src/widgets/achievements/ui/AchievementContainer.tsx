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
  const { data: closedHackathons } = useHackathonsQuery({status: 'closed'});
  // Создаем Set с ID хакатонов, которые уже есть в достижениях пользователя
const achievedHackathonIds = new Set(
  user?.achievements?.map(achievement => achievement.hackathonId) || []
);

// Фильтруем закрытые хакатоны, оставляя только те, которых нет в достижениях
const noAchsHackathons = closedHackathons.items?.filter(
  hackathon => !achievedHackathonIds.has(hackathon.id)
) || [];

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
          hackathons={noAchsHackathons}
          onDone={onDone}
        />
      ) : (
        achievement && <AchievementEditForm achievement={achievement} onDone={onDone} />
      )}
    </>
  );
};
