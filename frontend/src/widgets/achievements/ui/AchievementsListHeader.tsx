import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FC } from 'react';
import { IconButton, Text } from '@telegram-apps/telegram-ui';

import { paths } from '@/shared/routing/paths';
import { SIcon } from '@/shared/ui';

interface AchievementsListHeaderProps {
  showAdd: boolean;
}

export const AchievementsListHeader: FC<AchievementsListHeaderProps> = ({ showAdd }) => {
  const navigate = useNavigate();
  return (
    <Header>
      <HeaderTitle weight="2">{'Достижения'}</HeaderTitle>
      {showAdd && (
        <IconButton size="m" onClick={() => navigate(paths.userAchievementsRoot)}>
          <SIcon name={'plus'} />
        </IconButton>
      )}
    </Header>
  );
};

const Header = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  width: 100%;
  padding: 0 0;
`;

const HeaderTitle = styled(Text)`
  color: var(--tg-theme-accent-text-color);
  text-align: left;
`;
