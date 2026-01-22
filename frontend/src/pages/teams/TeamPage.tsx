import { useTeam } from "@/entities/team";
import { Page } from "@/shared/ui";
import { MyHackathonTeam } from "@/widgets/hackathon/my-team";
import { useParams } from "react-router-dom";
import NotFound from "../not-found/NotFound";
import { useAuthUser } from "@/entities/user";

export const TeamPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: team } = useTeam(Number(id));
  const { data: user } = useAuthUser();

  if (team === null) {
    return <NotFound />;
  }

  if (team.members.filter((m) => m.user.id === user.id).length > 0) {
    return (
      <Page>
        <MyHackathonTeam
          hackathonId={team.hackathonId}
          team={team}
          hackathonName={team.hackathonName}
          teamMembersLimit={team.teamMembersLimit}
        />
      </Page>
    );
  }
  return <Page/> 
};

export default TeamPage;
