import { FC } from 'react';
import { IconButton } from '@telegram-apps/telegram-ui';
import styled from 'styled-components';

import { SIcon } from '@/shared/ui';
import { ResponseStatus } from '@/entities/response';
import { useAnswerOnResponse } from '../model/useAnswerOnResponse';

interface ResponseRespondButtonsProps {
  responseId: number;
  onAnswered?: (status: ResponseStatus) => void;
}

export const ResponseRespondButtons: FC<ResponseRespondButtonsProps> = ({
  responseId,
  onAnswered,
}) => {
  const { answer, isLoading } = useAnswerOnResponse({ responseId, onAnswered });

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
        <SIcon size={24} name="cross" color="#F55A5A" />
      </IconButton>

      <IconButton
        style={{ borderRadius: 6, padding: 6 }}
        disabled={isLoading}
        onClick={e => {
          e.stopPropagation();
          answer('accepted');
        }}
      >
        <SIcon size={24} name="plus" />
      </IconButton>
    </Buttons>
  );
};

const Buttons = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;
