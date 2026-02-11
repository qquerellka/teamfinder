import { FC, useMemo, useState } from 'react';
import styled from 'styled-components';

import type { Application } from '@/entities/application';
import { useHackathonApplications } from '@/entities/application';
import type { Team } from '@/entities/team';
import { NoItems } from '@/shared/ui';
import { useTeamInvites } from '@/entities/invite';
import { useSendInviteAction } from '@/features/invite/send';
import { useNavigate } from 'react-router-dom';
import { getUserPath } from '@/shared/routing/paths';
import { ApplicationCard } from '@/widgets/team/application-card';

interface TeamApplicationsProps {
  team: Team;
}

export const TeamApplications: FC<TeamApplicationsProps> = ({ team }) => {
  const navigate = useNavigate();

  const { data: applicationsData } = useHackathonApplications(team.hackathonId);
  const applications = applicationsData?.items.filter(i => i.status === 'published') ?? [];

  const { data: invitesData, isFetching: isInvitesFetching } = useTeamInvites(team.id);

  const invites = invitesData.filter(i => i.status === 'pending') ?? [];
  const invitedIds = useMemo(() => new Set(invites.map(i => i.applicationId)), [invites]);

  const { send, isSending } = useSendInviteAction(team.id);

  const [invitingAppId, setInvitingAppId] = useState<number | null>(null);

  const handleInvite = async (application: Application) => {
    if (invitedIds.has(application.id)) return;

    setInvitingAppId(application.id);
    try {
      await send(application.id, application.role);
    } finally {
      setInvitingAppId(null);
    }
  };

  if (applications.length === 0) {
    return <NoItems title={'У этого хакатона нет анкет :('} />;
  }

  return (
    <ApplicationsList>
      {applications.map(a => (
        <ApplicationCard
          key={a.id}
          application={a}
          invited={invitedIds.has(a.id)}
          onInvite={() => handleInvite(a)}
          isInviting={invitingAppId === a.id || isSending || isInvitesFetching}
          onNavigate={() => navigate(getUserPath(a.userId))}
        />
      ))}
    </ApplicationsList>
  );
};

const ApplicationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
