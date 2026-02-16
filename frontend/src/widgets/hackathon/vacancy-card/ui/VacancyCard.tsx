import { FC } from 'react';
import styled from 'styled-components';
import { IconButton, Text } from '@telegram-apps/telegram-ui';

import { RoleBadge, SIcon } from '@/shared/ui';
import { Vacancy } from '@/entities/vacancy';

interface VacancyCardProps {
  vacancy: Vacancy;
  responsed: boolean;
  isResponsing: boolean;
  onResponse: () => void;
  onNavigate: () => void;
}

export const VacancyCard: FC<VacancyCardProps> = ({
  isResponsing,
  onResponse,
  onNavigate,
  responsed,
  vacancy,
}) => {
  
  return (
    <Wrapper onClick={onNavigate}>
      <FirstRow>
        <Text weight="2">{vacancy.teamName}</Text>
        <RoleBadge role={vacancy.role} />
      </FirstRow>

      <SecondRow>
        {responsed ? (
          <SIcon name="sentInvite" size={36} />
        ) : (
          <IconButton
            style={{ borderRadius: 6, padding: 6 }}
            onClick={e => {
              e.stopPropagation();
              onResponse();
            }}
            disabled={isResponsing}
          >
            <SIcon name="plus" size={24} />
          </IconButton>
        )}

        <Text>{vacancy.description}</Text>
      </SecondRow>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 1rem;
  background-color: var(--tg-theme-section-bg-color);
`;

const FirstRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 0.5rem;
`;

const SecondRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: 0.5rem;
`;
