import { FC, useMemo, useState } from "react";
import styled from "styled-components";
import { IconButton } from "@telegram-apps/telegram-ui";

import type { Application } from "@/entities/application";
import { useHackathonApplications } from "@/entities/application";
import type { Team } from "@/entities/team";
import { NoItems, RoleBadge, SIcon, SText } from "@/shared/ui";
import { useTeamInvites } from "@/entities/invite";
import { useSendInviteAction } from "@/features/invite/send";

interface TeamApplicationsProps {
  team: Team;
}

export const TeamApplications: FC<TeamApplicationsProps> = ({ team }) => {
  const { data: applicationsData } = useHackathonApplications(team.hackathonId);
  const applications =
    applicationsData?.items.filter((i) => i.status === "published") ?? [];

  const { data: invitesData, isFetching: isInvitesFetching } = useTeamInvites(
    team.id
  );

  const invites = invitesData.filter((i) => i.status === "pending") ?? [];
  const invitedIds = useMemo(
    () => new Set(invites.map((i) => i.applicationId)),
    [invites]
  );

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
    return <NoItems title={"У этого хакатона нет анкет :("} />;
  }

  return (
    <ApplicationsList>
      {applications.map((a) => (
        <ApplicationCard
          key={a.id}
          application={a}
          invited={invitedIds.has(a.id)}
          onInvite={() => handleInvite(a)}
          isInviting={invitingAppId === a.id || isSending || isInvitesFetching}
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

interface ApplicationCardProps {
  application: Application;
  invited: boolean;
  isInviting: boolean;
  onInvite: () => void;
}

const ApplicationCard: FC<ApplicationCardProps> = ({
  application,
  invited,
  isInviting,
  onInvite,
}) => {
  const skillsString = useMemo(() => {
    const skills = application.skills?.slice(0, 4) ?? [];
    return skills.map((s) => s.name).join(", ");
  }, [application.skills]);

  return (
    <Wrapper>
      <FirstRow>
        <SText $fs={16} $fw={600}>
          {application.firstName} {application.lastName}
        </SText>
        <RoleBadge role={application.role} />
      </FirstRow>

      <SecondRow>
        {invited ? (
          <SIcon name="sentInvite" />
        ) : (
          <IconButton onClick={onInvite} disabled={isInviting}>
            <SIcon name="plus" />
          </IconButton>
        )}

        <SText>{skillsString}</SText>
      </SecondRow>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 1rem;
  background-color: var(--tg-theme-section-bg-color);
`;

const FirstRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 0.5rem;
`;

const SecondRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: 0.5rem;
`;
