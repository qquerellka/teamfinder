import { useHackathonQuery } from "@/entities/hackathon/api/hooks";
import { HackathonTeam } from "@/features/team/create/ui/HackathonTeam";
import { useParams } from "react-router-dom";
import styled from "styled-components";

export const HackathonTeamPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: hackathon } = useHackathonQuery(Number(id));

  return (
    <Wrapper>
      <HackathonTeam hackathon={hackathon} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default HackathonTeamPage;
