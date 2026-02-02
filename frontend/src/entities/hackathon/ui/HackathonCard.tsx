import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { Card, InlineButtons, Title } from '@telegram-apps/telegram-ui';

import type { Hackathon } from '@/entities/hackathon';
import {
  formatDateRange,
  formatRegistrationDate,
  getTeamMembersRange,
} from '@/shared/helpers/date';
import { ImageWithSkeleton, SIcon, SText } from '@/shared/ui';
import type { IconName } from '@/shared/ui/SIcon';
import { EHackathonMode } from '@/shared/types/enums';
type HackathonCardVariant = 'full' | 'compact';

interface HackathonCardProps {
  hackathon: Hackathon;
  variant?: HackathonCardVariant;
  showShareButton?: boolean;
  onShareClick?: () => void;
}
interface HackathonParamConfig {
  icon: IconName;
  text: string;
}
export const HackathonCard: FC<HackathonCardProps> = ({
  hackathon,
  variant = 'full',
  showShareButton = false,
  onShareClick,
}) => {
  const params: HackathonParamConfig[] = useMemo(
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
    <SHackathonCard>
      <SHackathonImage>
        <ImageWithSkeleton src={hackathon.imageLink} alt={hackathon.name} />
      </SHackathonImage>

      <SHackathonInfo>
        <SText weight="2">{hackathon.name}</SText>

        <HackathonParams>
          {visibleParams.map(({ icon, text }, index) => (
            <HackathonParam key={`${index}-${text}`}>
              <SIcon name={icon} size={16} />
              <SubTitle level="2" weight="3">
                {text}
              </SubTitle>
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
      </SHackathonInfo>
    </SHackathonCard>
  );
};

const SHackathonCard = styled(Card)`
  background: var(--tg-theme-section-bg-color, #fff);
  border-radius: 1rem;

  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SHackathonImage = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 0rem;
`;

const SHackathonInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem 0.625rem 0.75rem 0.625rem;
  position: relative;
`;

const SubTitle = styled(Title)`
  color: var(--tg-theme-hint-color, #8e8e93);
  font-size: 1rem;
  line-height: normal;
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
