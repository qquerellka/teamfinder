import { Application } from '@/entities/application';
import { RoleBadge, SIcon } from '@/shared/ui';
import { IconButton, Text } from '@telegram-apps/telegram-ui';
import { FC, useMemo } from 'react';
import styled from 'styled-components';

interface ApplicationCardProps {
  application: Application;
  invited: boolean;
  isInviting: boolean;
  onInvite: () => void;
  onNavigate: () => void;
}

export const ApplicationCard: FC<ApplicationCardProps> = ({
  application,
  invited,
  isInviting,
  onInvite,
  onNavigate,
}) => {
  const skillsString = useMemo(() => {
    const skills = application.skills?.slice(0, 4) ?? [];
    return skills.map(s => s.name).join(', ');
  }, [application.skills]);

  return (
    <Wrapper onClick={onNavigate}>
      <FirstRow>
        <Text weight="2">
          {application.firstName} {application.lastName}
        </Text>
        <RoleBadge role={application.role} />
      </FirstRow>

      <SecondRow>
        {invited ? (
          <SIcon name="sentInvite" size={36} />
        ) : (
          <IconButton
            onClick={e => {
              e.stopPropagation();
              onInvite();
            }}
            disabled={isInviting}
          >
            <SIcon name="plus" />
          </IconButton>
        )}

        <Text>{skillsString}</Text>
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
