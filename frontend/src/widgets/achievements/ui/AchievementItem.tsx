import { Cell, Text } from '@telegram-apps/telegram-ui';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Achievement, formatHackPlace } from '@/entities/achievement';
import { paths } from '@/shared/routing/paths';

interface AchievementItemProps {
  achievement: Achievement;
  canEdit: boolean;
}

export const AchievementItem: FC<AchievementItemProps> = ({ achievement, canEdit }) => {
  const navigate = useNavigate();

  const handleAchievementClick = (id: number) => {
    navigate(`${paths.userRoot}/achievements/${id}`);
  };

  const placeText = formatHackPlace(achievement.place);

  if (canEdit)
    return (
      <AchievementContainer
        onClick={() => handleAchievementClick(achievement.id)}
        after={<PlaceText weight="2">{placeText}</PlaceText>}
      >
        <Text weight="2">{achievement.hackathonName}</Text>
      </AchievementContainer>
    );
  return (
    <AchievementContainer after={<PlaceText weight="2">{placeText}</PlaceText>}>
      <Text weight="2">{achievement.hackathonName}</Text>
    </AchievementContainer>
  );
};

const AchievementContainer = styled(Cell)`
  background-color: var(--tg-theme-section-bg-color);
  border-radius: 1rem;
`;

const PlaceText = styled(Text)`
  white-space: nowrap;
  flex-shrink: 0;
`;
