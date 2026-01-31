import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FC } from 'react';
import { IconButton } from '@telegram-apps/telegram-ui';

import { paths } from '@/shared/routing/paths';
import { SIcon, SText } from '@/shared/ui';

interface AchievementsListHeaderProps {
  showAdd: boolean;
}

export const AchievementsListHeader: FC<AchievementsListHeaderProps> = ({ showAdd }) => {
  const navigate = useNavigate();
  return (
    <Header>
      <HeaderTitle $fs={15} $fw={600}>
        {'Достижения'}
      </HeaderTitle>
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

const HeaderTitle = styled(SText)`
  color: var(--tg-theme-accent-text-color);
  text-align: left;
`;
