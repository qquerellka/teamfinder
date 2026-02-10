import { IconButton } from '@telegram-apps/telegram-ui';
import { FC } from 'react';
import styled from 'styled-components';

import { formatRegistrationDate } from '@/shared/helpers/date';
import { Role } from '@/shared/types/enums';
import { RoleBadge, SIcon, SText, InvitesBadge } from '@/shared/ui';

interface ApplicationCardProps {
  hackathonName: string;
  registrationEndDate: Date;
  city: string;
  mode: string;
  role: Role;
  invitesCount: number;
  onNavigate: () => void;
}

export const ApplicationCard: FC<ApplicationCardProps> = ({
  city,
  hackathonName,
  invitesCount,
  mode,
  registrationEndDate,
  role,
  onNavigate,
}) => {
  return (
    <ApplicationContainer onClick={onNavigate}>
      <NavigateIcon style={{ borderRadius: 6, padding: 6 }}>
        <SIcon name="arrow" size={24} />
      </NavigateIcon>
      <SText $fs={16} $fw={600}>
        {hackathonName}
      </SText>
      <ApplicationInfo>
        <InfoItem>
          <SIcon name={'hackathonRegistration'} />
          <SText $fs={14} $fw={500}>
            {formatRegistrationDate(registrationEndDate)}
          </SText>
        </InfoItem>
        <InfoItem>
          <SIcon name={'hackathonPlace'} />
          <SText $fs={14} $fw={500}>{`${city} • ${mode}`}</SText>
        </InfoItem>
      </ApplicationInfo>
      {invitesCount > 0 && <InvitesBadge count={invitesCount} />}
      <RoleBadge role={role}></RoleBadge>
    </ApplicationContainer>
  );
};

const ApplicationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: start;
  padding: 1rem;
  border-radius: 1rem;
  background-color: var(--tg-theme-section-bg-color);
  position: relative;
`;

const ApplicationInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
`;

const NavigateIcon = styled(IconButton)`
  position: absolute;
  top: 1rem;
  right: 1rem;
`;