import { FC } from 'react';
import styled from 'styled-components';
import { SIcon, SText } from '@/shared/ui';

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
        <SText $fs={16} $fw={700}>
          Приглашение
        </SText>
        {actions}
      </FirstRow>

      <SecondRow>
        <SText $fs={14} $fw={500}>
          {teamName}
        </SText>

        <CountTeamMembers>
          <SIcon name="profile" />
          <SText $fs={14} $fw={500}>
            {teamMembersCount} / {teamMembersLimit}
          </SText>
        </CountTeamMembers>
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

const CountTeamMembers = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
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
