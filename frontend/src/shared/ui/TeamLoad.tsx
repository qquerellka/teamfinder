import styled from 'styled-components';
import { SIcon } from './SIcon';
import { SText } from './SText';
import { FC } from 'react';
interface TeamLoadProps {
  teamMembersCount: number;
  teamMembersLimit: number;
}
export const TeamLoad: FC<TeamLoadProps> = ({ teamMembersCount, teamMembersLimit }) => {
  return (
    <CountTeamMembers>
      <SIcon name="profile" />
      <SText $fs={14} $fw={500}>
        {teamMembersCount} / {teamMembersLimit}
      </SText>
    </CountTeamMembers>
  );
};

const CountTeamMembers = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;
