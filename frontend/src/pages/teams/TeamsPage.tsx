import { useMyTeams } from "@/entities/team";
import { TeamCard } from "@/entities/team/ui/TeamCard";
import { getHackathonTeamPath } from "@/shared/routing/paths";
import { Page, SText } from "@/shared/ui";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

export const UserTeamsPage = () => {
  const { data: teams } = useMyTeams();
  const navigate = useNavigate();
  if (!teams || teams.length === 0) {
    return (
      <NotFound>
        <SText>У вас нет активных команд :(</SText>
      </NotFound>
    );
  }
  return (
    <Page>
      <TeamsList>
        <SText>Мои команды</SText>
        {teams.map((t) => (
          <TeamCard
            invitesCount={t.countInvites}
            teamName={t.name}
            hackathonName={t.hackathonName}
            teamMembersCount={t.teamMembersCount}
            teamMembersLimit={t.teamMembersLimit}
            isCaptain={t.isCaptain}
            onNavigate={() => navigate(getHackathonTeamPath(t.hackathonId))}
          />
        ))}
      </TeamsList>
    </Page>
  );
};

export default UserTeamsPage;

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
