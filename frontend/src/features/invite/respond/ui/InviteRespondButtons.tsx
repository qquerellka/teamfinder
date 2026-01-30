import { FC } from 'react';
import { IconButton } from '@telegram-apps/telegram-ui';
import styled from 'styled-components';

import { SIcon } from '@/shared/ui';
import { InviteStatus } from '@/entities/invite';
import { useAnswerOnInvite } from '../model/useAnswerOnInvite';

interface InviteRespondButtonsProps {
  inviteId: number;
  onAnswered?: (status: InviteStatus) => void;
}

export const InviteRespondButtons: FC<InviteRespondButtonsProps> = ({ inviteId, onAnswered }) => {
  const { answer, isLoading } = useAnswerOnInvite({ inviteId, onAnswered });

  return (
    <Buttons>
      <IconButton
        style={{ borderRadius: 6, padding: 6 }}
        disabled={isLoading}
        onClick={e => {
          e.stopPropagation();
          answer('rejected');
        }}
      >
        <SIcon name="cross" color="#F55A5A" size={24} />
      </IconButton>

      <IconButton
        style={{ borderRadius: 6, padding: 6 }}
        disabled={isLoading}
        onClick={e => {
          e.stopPropagation();
          answer('accepted');
        }}
      >
        <SIcon name="plus" size={24} />
      </IconButton>
    </Buttons>
  );
};

const Buttons = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;
