import { Application } from '@/entities/application';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Text } from '@telegram-apps/telegram-ui';
import { ApplicationCard } from '@/entities/application/ui/ApplicationCard';
import { getHackathonParticipationPath } from '@/shared/routing/paths';

interface ApplicationsListProps {
  applications: Application[];
}

export const ApplicationsList: FC<ApplicationsListProps> = ({ applications }) => {
  const navigate = useNavigate();

  return (
    <ApplicationsListContainer>
      <Text>Мои анкеты</Text>
      {applications.map(a => (
        <ApplicationCard
          key={a.id}
          invitesCount={a.invitesCount}
          hackathonName={a.hackathonName}
          registrationEndDate={a.registrationEndDate}
          city={a.city}
          mode={a.mode}
          role={a.role}
          onNavigate={() => navigate(getHackathonParticipationPath(a.hackathonId))}
        />
      ))}
    </ApplicationsListContainer>
  );
};

const ApplicationsListContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 1rem;
`;
