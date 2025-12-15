import { useAuthUserApplications } from "@/entities/application";
import { ApplicationCard } from "@/entities/application/ui/ApplicationCard";
import { getHackathonParticipationPath } from "@/shared/routing/paths";
import { Page, SText } from "@/shared/ui";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

export const ApplicationsPage = () => {
  const { data: applications } = useAuthUserApplications();
  const navigate = useNavigate();
  if (!applications || applications.length === 0) {
    return (
      <NotFound>
        <SText>У вас нет активных анкет :(</SText>
      </NotFound>
    );
  }
  return (
    <Page>
      <TeamsList>
        <SText>Мои команды</SText>
        {applications.map((a) => (
          <ApplicationCard
            invitesCount={a.invitesCount}
            hackathonName={a.hackathonName}
            registrationEndDate={a.registrationEndDate}
            city={a.city}
            mode={a.mode}
            role={a.role}
            onNavigate={() =>
              navigate(getHackathonParticipationPath(a.hackathonId))
            }
          />
        ))}
      </TeamsList>
    </Page>
  );
};

export default ApplicationsPage;

const NotFound = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;
const TeamsList = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 1rem;
`;
