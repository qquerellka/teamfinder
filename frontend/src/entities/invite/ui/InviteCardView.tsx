import { FC } from 'react';
import styled from 'styled-components';
import { TeamLoad } from '@/shared/ui';
import { Subheadline, Text } from '@telegram-apps/telegram-ui';

interface InviteCardViewProps {
  teamName: string;
  teamMembersCount: number;
  teamMembersLimit: number;
  actions?: React.ReactNode;
  onNavigate: () => void;
}

export const InviteCardView: FC<InviteCardViewProps> = ({
  teamName,
  teamMembersCount,
  teamMembersLimit,
  actions,
  onNavigate,
}) => {
  return (
    <InviteCardContainer onClick={onNavigate}>
      <FirstRow>
        <Text weight="1">Приглашение</Text>
        {actions}
      </FirstRow>

      <SecondRow>
        <Subheadline level="2" weight="2">
          {teamName}
        </Subheadline>

        <TeamLoad teamMembersCount={teamMembersCount} teamMembersLimit={teamMembersLimit} />
      </SecondRow>
    </InviteCardContainer>
  );
};

const InviteCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 1rem;
  background-color: var(--tg-theme-section-bg-color);
`;

const FirstRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SecondRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
