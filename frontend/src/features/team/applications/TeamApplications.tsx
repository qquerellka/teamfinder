import { useHackathonApplications } from "@/entities/application/api/hooks";
import { Application } from "@/entities/application/model/types";
import { Team } from "@/entities/team/model/types";
import { RoleBadge, SIcon, SText, STitle } from "@/shared/ui";
import { IconButton } from "@telegram-apps/telegram-ui";
import { FC, useMemo } from "react";

import plusIcon from "@/assets/icons/plusIcon.svg?react";
import styled from "styled-components";
import { useCreateInvite } from "@/entities/invite/api/hooks";
interface TeamApplicationsProps {
  team: Team;
}
export const TeamApplications: FC<TeamApplicationsProps> = ({ team }) => {
  const { data: applications } = useHackathonApplications(team.hackathonId);
  return (
    <ApplicationsList>
      {applications.items.map((a) => (
        <ApplicationCard application={a} team={team}/>
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
  team: Team,
}

export const ApplicationCard: FC<ApplicationCardProps> = ({ application, team }) => {
const skillsString = useMemo(() => {
  const skills = application.skills.length < 5
    ? application.skills
    : application.skills.slice(0, 4);

  return skills.map((s) => s.name).join(", ");
}, [application.skills]);


  console.log(application.skills.join());
const inviteMutation = useCreateInvite();

const handleInvite = async () => {
  await inviteMutation.mutateAsync({
    teamId: team.id,
    payload: {
      applicationId: application.id,
      role: application.role,
    },
  });
};


  return (
    <Wrapper>
      <FirstRow>
        <STitle $fs={16} $fw={600}>
          {application.firstName} {application.lastName}
        </STitle>
        <RoleBadge role={application.role} />
      </FirstRow>

      <SecondRow>
        <IconButton onClick={handleInvite}>
          <SIcon icon={plusIcon} />
        </IconButton>
        <SText>{String(skillsString)}</SText>
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
