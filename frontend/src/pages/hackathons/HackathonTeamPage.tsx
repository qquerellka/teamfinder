// import { useMyTeamOnHackathon } from "@/entities/team";
// import { Page } from "@/shared/ui";
// import { MyHackathonTeam } from "@/widgets/hackathon/my-team";
// import { useParams } from "react-router-dom";
// import NotFound from "../not-found/NotFound";

// export const HackathonTeamPage = () => {
//   const { id } = useParams<{ id: string }>();
//   const { data: team } = useMyTeamOnHackathon(Number(id));

//   if (team === null) {
//     return <NotFound />;
//   }

//   return (
//     <Page>
//       <MyHackathonTeam team={team} hackathonId={team.hackathonId} hackathonName={team.hackathonName} teamMembersLimit={team.teamMembersLimit} />
//     </Page>
//   );
// };

// export default HackathonTeamPage;
