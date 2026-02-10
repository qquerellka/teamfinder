import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { Card, InlineButtons, Title } from '@telegram-apps/telegram-ui';

import type { Hackathon } from '@/entities/hackathon';
import {
  formatDateRange,
  formatRegistrationDate,
  getTeamMembersRange,
} from '@/shared/helpers/date';
import { ImageWithSkeleton, SIcon, IconName } from '@/shared/ui';
import { EHackathonMode } from '@/shared/types/enums';

type HackathonCardVariant = 'full' | 'compact';

interface HackathonCardProps {
  hackathon: Hackathon;
  variant?: HackathonCardVariant;
  showShareButton?: boolean;
  onShareClick?: () => void;
}

export const HackathonCard: FC<HackathonCardProps> = ({
  hackathon,
  variant = 'full',
  showShareButton = false,
  onShareClick,
}) => {
  const params: { icon: IconName; text: string }[] = useMemo(
    () => [
      {
        icon: 'hackathonDate',
        text: formatDateRange(hackathon.startDate, hackathon.endDate),
      },
      {
        icon: 'hackathonRegistration',
        text:
          hackathon.registrationEndDate === null
            ? ''
            : formatRegistrationDate(hackathon.registrationEndDate),
      },
      {
        icon: 'hackathonPlace',
        text:
          hackathon.mode === EHackathonMode.ONLINE
            ? `${hackathon.mode}`
            : `${hackathon.city} • ${hackathon.mode}`,
      },
      {
        icon: 'hackathonPrize',
        text: hackathon.prizeFund?.toLocaleString() ?? 'Без призовых',
      },
      {
        icon: 'hackathonTeam',
        text: getTeamMembersRange(hackathon.teamMembersLimit, hackathon.teamMembersMinimum),
      },
    ],
    [hackathon],
  );

  const visibleParams =
    variant === 'compact' ? params.filter(({ icon }) => icon !== 'hackathonTeam') : params;

  return (
    <HackathonCardContainer>
      <HackathonImage>
        <ImageWithSkeleton src={hackathon.imageLink} alt={hackathon.name} />
      </HackathonImage>

      <HackathonInfo>
        <Title weight="2" plain={true}>
          {hackathon.name}
        </Title>
        <HackathonParams>
          {visibleParams.map(({ icon, text }, index) => (
            <HackathonParam key={`${index}-${text}`}>
              <SIcon name={icon} size={16} />
              <SubTitlee level="2" weight="3">
                {text}
              </SubTitlee>
            </HackathonParam>
          ))}
        </HackathonParams>

        {showShareButton && (
          <ButtonContainer>
            <SInlineButtons mode="plain" onClick={onShareClick}>
              <SIcon name={'share'} />
            </SInlineButtons>
          </ButtonContainer>
        )}
      </HackathonInfo>
    </HackathonCardContainer>
  );
};

const HackathonCardContainer = styled(Card)`
  background: var(--tg-theme-section-bg-color, #fff);
  border-radius: 1rem;

  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`;

const HackathonImage = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 0rem;
`;

const HackathonInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem 0.625rem 0.75rem 0.625rem;
  position: relative;
`;

const HackathonParams = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const HackathonParam = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
`;

const SubTitlee = styled(Title)`
  color: var(--tg-theme-hint-color, #8e8e93);
  font-size: 1rem;
  line-height: normal;
`;

const ButtonContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
`;

const SInlineButtons = styled(InlineButtons.Item)`
  padding: 0.75rem 0.625rem;
  min-height: auto;
  min-width: auto;
`;
