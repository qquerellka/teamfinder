import { SIcon, SText, TeamLoad } from "@/shared/ui";
import { FC } from "react";
import styled from "styled-components";

interface TeamCardProps {
  teamName: string;
  hackathonName: string;
  teamMembersCount: number;
  teamMembersLimit: number;
  isCaptain: boolean;
  onNavigate: () => void;
}

export const TeamCard: FC<TeamCardProps> = ({
  hackathonName,
  isCaptain,
  teamMembersCount,
  teamMembersLimit,
  teamName,
  onNavigate,
}) => {
  return (
    <Wrapper>
      <FirstRow>
        <Name>
          <SText>{teamName}</SText>
          {isCaptain && <SIcon name={"captain"} color={"#F3BD28"}></SIcon>}
        </Name>
        <SIcon onClick={onNavigate} name={"arrow"} />
      </FirstRow>
      <SecondRow>
        <SText>{hackathonName}</SText>
        <TeamLoad
          teamMembersCount={teamMembersCount}
          teamMembersLimit={teamMembersLimit}
        />
      </SecondRow>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 1rem;
  background-color: var(--tg-theme-section-bg-color);
`;
const Name = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
`;
const FirstRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
const SecondRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
