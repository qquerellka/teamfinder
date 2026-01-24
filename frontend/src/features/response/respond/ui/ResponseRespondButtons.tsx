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
      <IconButton disabled={isLoading} onClick={() => answer('rejected')}>
        <SIcon name="cross" color="#F55A5A" />
      </IconButton>

      <IconButton disabled={isLoading} onClick={() => answer('accepted')}>
        <SIcon name="plus" />
      </IconButton>
    </Buttons>
  );
};

const Buttons = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;
