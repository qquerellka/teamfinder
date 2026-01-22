import { useHackathonQuery } from "@/entities/hackathon";
import { Page } from "@/shared/ui";
import { MyHackathonTeam } from "@/widgets/hackathon/my-team";
import { useParams } from "react-router-dom";

export const HackathonTeamPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: hackathon } = useHackathonQuery(Number(id));

  return (
    <Page>
      <MyHackathonTeam hackathon={hackathon} />
    </Page>
  );
};

export default HackathonTeamPage;
