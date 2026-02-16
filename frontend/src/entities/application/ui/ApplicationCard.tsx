import { IconButton, Text, Subheadline } from '@telegram-apps/telegram-ui';
import { FC } from 'react';
import styled from 'styled-components';

import { formatRegistrationDate } from '@/shared/helpers/formatters/date';
import { Role } from '@/shared/types/enums';
import { RoleBadge, SIcon, InvitesBadge } from '@/shared/ui';

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
      <Text weight="2">{hackathonName}</Text>
      <ApplicationInfo>
        <InfoItem>
          <SIcon name={'hackathonRegistration'} />
          <Subheadline plain={true} level="2" weight="2">
            {formatRegistrationDate(registrationEndDate)}
          </Subheadline>
        </InfoItem>
        <InfoItem>
          <SIcon name={'hackathonPlace'} />
          <Subheadline plain={true} level="2" weight="2">{`${city} • ${mode}`}</Subheadline>
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
