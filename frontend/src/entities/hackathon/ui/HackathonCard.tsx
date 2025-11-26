import { FC, useMemo } from "react";
import styled from "styled-components";
import { Card, InlineButtons, Title } from "@telegram-apps/telegram-ui";

import type { Hackathon } from "@/entities/hackathon/model/types";
import {
  formatDateRange,
  formatRegistrationDate,
  getTeamMembersRange,
} from "@/shared/helpers/date";
import { STitle } from "@/shared/ui/STitle";
import { SIcon } from "@/shared/ui/SIcon";

import shareIcon from "@/assets/icons/shareIcon.svg?react";
import hackathonPrizeIcon from "@/assets/icons/hackathonCard/hackathonPrizeIcon.svg?react";
import hackathonDate from "@/assets/icons/hackathonCard/hackathonDateIcon.svg?react";
import hackathonPlace from "@/assets/icons/hackathonCard/hackathonPlaceIcon.svg?react";
import hackathonRegistration from "@/assets/icons/hackathonCard/hackathonRegistrationIcon.svg?react";
import hackathonTeam from "@/assets/icons/hackathonCard/hackathonTeamIcon.svg?react";
import defaultImage from "@/assets/hackathonImage6.webp";

type HackathonCardVariant = "full" | "compact";

interface HackathonCardProps {
  hackathon: Hackathon;
  /** full — все параметры, compact — без команды и без кнопки share */
  variant?: HackathonCardVariant;
  /** показывать ли кнопку шаринга */
  showShareButton?: boolean;
  /** коллбек по клику на иконку share */
  onShareClick?: () => void;
}

export const HackathonCard: FC<HackathonCardProps> = ({
  hackathon,
  variant = "full",
  showShareButton = false,
  onShareClick,
}) => {
  const params = useMemo(
    () => [
      {
        icon: hackathonDate,
        text: formatDateRange(hackathon.startDate, hackathon.endDate),
      },
      {
        icon: hackathonRegistration,
        text: formatRegistrationDate(hackathon.registrationEndDate),
      },
      {
        icon: hackathonPlace,
        text: `${hackathon.city} • ${hackathon.mode}`,
      },
      {
        icon: hackathonPrizeIcon,
        text: hackathon.prizeFund.toLocaleString(),
      },
      {
        icon: hackathonTeam,
        text: getTeamMembersRange(
          hackathon.teamMembersLimit,
          hackathon.teamMembersMinimum,
        ),
      },
    ],
    [hackathon],
  );

  const visibleParams =
    variant === "compact"
      ? params.filter(({ icon }) => icon !== hackathonTeam)
      : params;

  return (
    <SHackathonCard>
      <SHackathonImage>
        <SImage
          src={hackathon.imageLink || defaultImage}
          alt={hackathon.name ?? "Hackathon"}
        />
      </SHackathonImage>

      <SHackathonInfo>
        <STitle weight="2">{hackathon.name}</STitle>

        <HackathonParams>
          {visibleParams.map(({ icon, text }, index) => (
            <HackathonParam key={`${index}-${text}`}>
              <SIcon icon={icon} size={16} />
              <SubTitle level="2" weight="3">
                {text}
              </SubTitle>
            </HackathonParam>
          ))}
        </HackathonParams>

        {showShareButton && (
          <ButtonContainer>
            <SInlineButtons mode="plain" onClick={onShareClick}>
              <SIcon icon={shareIcon} />
            </SInlineButtons>
          </ButtonContainer>
        )}
      </SHackathonInfo>
    </SHackathonCard>
  );
};

// ===== стили =====

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
  border-radius: 1.5rem;
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

const SImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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
