import styled from 'styled-components';
import { SIcon } from './SIcon';
import { FC } from 'react';
import { Subheadline } from '@telegram-apps/telegram-ui';

interface TeamLoadProps {
  teamMembersCount: number;
  teamMembersLimit: number;
}
export const TeamLoad: FC<TeamLoadProps> = ({ teamMembersCount, teamMembersLimit }) => {
  return (
    <CountTeamMembers>
      <SIcon name="profile" />
      <Subheadline weight="2">
        {teamMembersCount} / {teamMembersLimit}
      </Subheadline>
    </CountTeamMembers>
  );
};

const CountTeamMembers = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;
