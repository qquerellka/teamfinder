import { SIcon, SText, TeamLoad } from '@/shared/ui';
import { IconButton } from '@telegram-apps/telegram-ui';
import { FC } from 'react';
import styled from 'styled-components';

interface TeamCardProps {
  teamName: string;
  hackathonName: string;
  teamMembersCount: number;
  teamMembersLimit: number;
  isCaptain: boolean;
  invitesCount: number;
  onNavigate: () => void;
}

export const TeamCard: FC<TeamCardProps> = ({
  hackathonName,
  isCaptain,
  teamMembersCount,
  teamMembersLimit,
  teamName,
  onNavigate,
  invitesCount,
}) => {
  return (
    <Wrapper onClick={onNavigate}>
      <Row>
        <Name>
          <SText>{teamName}</SText>
          {isCaptain && <SIcon name={'captain'} size={16} color={'#F3BD28'}></SIcon>}
        </Name>
        <IconButton style={{ borderRadius: 6, padding: 6 }}>
          <SIcon name={'arrow'} size={24} />
        </IconButton>
      </Row>
      {invitesCount > 0 ? (
        <>
          <Row>
            <SText>{hackathonName}</SText>
          </Row>
          <Row>
            <InvitesBadge count={invitesCount} />
            <TeamLoad teamMembersCount={teamMembersCount} teamMembersLimit={teamMembersLimit} />
          </Row>
        </>
      ) : (
        <Row>
          <SText>{hackathonName}</SText>
          <TeamLoad teamMembersCount={teamMembersCount} teamMembersLimit={teamMembersLimit} />
        </Row>
      )}
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
const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

interface InvitesBadgeProps {
  count: number;
}
export const InvitesBadge: FC<InvitesBadgeProps> = ({ count }) => {
  return <Badge>{count} хотят вступить</Badge>;
};

const Badge = styled(SText)`
  border-radius: 1.5rem;
  padding: 0 0.5rem;
  background-color: var(--tg-theme-section-header-text-color);
`;
