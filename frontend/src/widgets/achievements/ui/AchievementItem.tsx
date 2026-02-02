import { Cell } from '@telegram-apps/telegram-ui';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Achievement, formatHackPlace } from '@/entities/achievement';
import { paths } from '@/shared/routing/paths';
import { SText } from '@/shared/ui';

interface AchievementItemProps {
  achievement: Achievement;
  canEdit: boolean;
}

export const AchievementItem: FC<AchievementItemProps> = ({ achievement, canEdit }) => {
  const navigate = useNavigate();

  const handleAchievementClick = (id: number) => {
    navigate(`${paths.userRoot}/achievements/${id}`);
  };

  if (canEdit)
    return (
      <AchievementContainer
        onClick={() => handleAchievementClick(achievement.id)}
        after={
          <SText $fs={16} $fw={500}>
            {formatHackPlace(achievement.place)}
          </SText>
        }
      >
        <SText $fs={16} $fw={500}>
          {achievement.hackathonName}
        </SText>
      </AchievementContainer>
    );
  return (
    <AchievementContainer
      after={
        <SText $fs={16} $fw={500}>
          {formatHackPlace(achievement.place)}
        </SText>
      }
    >
      <SText $fs={16} $fw={500}>
        {achievement.hackathonName}
      </SText>
    </AchievementContainer>
  );
};

const AchievementContainer = styled(Cell)`
  background-color: var(--tg-theme-section-bg-color);
  border-radius: 1rem;
`;
