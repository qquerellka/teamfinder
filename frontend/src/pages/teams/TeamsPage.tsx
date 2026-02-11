import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Text } from '@telegram-apps/telegram-ui';

import { useMyTeams, TeamCard } from '@/entities/team';
import { getTeamPath } from '@/shared/routing/paths';
import { NoItems, Page } from '@/shared/ui';

export const UserTeamsPage = () => {
  const { data: teams } = useMyTeams();
  const navigate = useNavigate();

  if (!teams || teams.length === 0) {
    return <NoItems title={'У вас нет активных команд :('} />;
  }

  return (
    <Page>
      <TeamsList>
        <Text>Мои команды</Text>
        {teams.map(t => (
          <TeamCard
            key={t.id}
            invitesCount={t.countInvites}
            teamName={t.name}
            hackathonName={t.hackathonName}
            teamMembersCount={t.teamMembersCount}
            teamMembersLimit={t.teamMembersLimit}
            isCaptain={t.isCaptain}
            onNavigate={() => navigate(getTeamPath(t.id))}
          />
        ))}
      </TeamsList>
    </Page>
  );
};

export default UserTeamsPage;

const TeamsList = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 1rem;
`;
