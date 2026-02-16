import { SIcon, TeamLoad } from '@/shared/ui';
import { IconButton, Text } from '@telegram-apps/telegram-ui';
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
          <Text>{teamName}</Text>
          {isCaptain && <SIcon name={'captain'} size={16} color={'#F3BD28'}></SIcon>}
        </Name>
        <IconButton style={{ borderRadius: 6, padding: 6, width: 36, height: 36 }}>
          <SIcon name={'arrow'} size={24} />
        </IconButton>
      </Row>
      {invitesCount > 0 ? (
        <>
          <Row>
            <Text>{hackathonName}</Text>
          </Row>
          <Row>
            <InvitesBadge count={invitesCount} />
            <TeamLoad teamMembersCount={teamMembersCount} teamMembersLimit={teamMembersLimit} />
          </Row>
        </>
      ) : (
        <Row>
          <Text>{hackathonName}</Text>
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
  word-break: break-word;
  overflow-wrap: break-word;
  position: relative;
  text-align: left;
`;

const Name = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;
  text-align: left;
  gap: 0.5rem;
`;
const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 1rem;
`;

interface InvitesBadgeProps {
  count: number;
}
export const InvitesBadge: FC<InvitesBadgeProps> = ({ count }) => {
    const verb = count === 1 ? "хочет" : "хотят";

  return <Badge>{count} {verb} вступить</Badge>;
};

const Badge = styled(Text)`
  border-radius: 1.5rem;
  padding: 0 0.5rem;
  background-color: var(--tg-theme-section-header-text-color);
`;
