import { useAuthUserApplications } from "@/entities/application";
import { ApplicationCard } from "@/entities/application/ui/ApplicationCard";
import { getHackathonParticipationPath } from "@/shared/routing/paths";
import { NoItems, Page, SText } from "@/shared/ui";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

export const ApplicationsPage = () => {
  const { data: applications } = useAuthUserApplications();
  const navigate = useNavigate();
  const filteredApplications = applications.filter(
    (a) => a.status === "published",
  );
  if (!filteredApplications || filteredApplications.length === 0) {
    return <NoItems title={"У вас нет активных анкет :("} />;
  }
  return (
    <Page>
      <TeamsList>
        <SText>Мои анкеты</SText>
        {filteredApplications.map((a) => (
          <ApplicationCard
            key={a.id}
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

const TeamsList = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 1rem;
`;
