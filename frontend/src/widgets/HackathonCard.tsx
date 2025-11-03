import { FC } from "react";
import styled from "styled-components";
import { Card, InlineButtons, Title } from "@telegram-apps/telegram-ui";
import { Hackathon } from "@/shared/types/hackathon";
import {
  formatDateRange,
  formatRegistrationDate,
  getTeamMembersRange,
} from "@/shared/helpers/date";
import { STitle } from "@/shared/ui/STitle";

import shareIcon from "../../assets/icons/shareIcon.svg";
import hackathonPrizeIcon from "../../assets/icons/hackathonCard/hackathonPrizeIcon.svg";
import hackathonDate from "../../assets/icons/hackathonCard/hackathonDateIcon.svg";
import hackathonPlace from "../../assets/icons/hackathonCard/hackathonPlaceIcon.svg";
import hackathonRegistration from "../../assets/icons/hackathonCard/hackathonRegistrationIcon.svg";
import hackathonTeam from "../../assets/icons/hackathonCard/hackathonTeamIcon.svg";
import defaultImage from "../../assets/hackathonImage6.webp";


interface HackathonCardProps {
  hackathon: Hackathon;
  type: "part" | "full";
}

export const HackathonCard: FC<HackathonCardProps> = ({
  hackathon,
  type = "full",
}) => {
  const hackathonParams = [
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
        hackathon.teamMembersMinimum
      ),
    },
  ];
  if (type === "part") {
    return (
      <SHackathonCard key={hackathon.id}>
        <SHackathonImage>
          {hackathon.imageLink ? (
            <SImage src={hackathon.imageLink} alt={hackathon.name} />
          ) : (
            <SImage src={defaultImage} alt={"Hackathon"} />
          )}
        </SHackathonImage>
        <SHackathonInfo>
          <STitle weight="2">{hackathon.name}</STitle>
          <HackathonParams>
            {hackathonParams
              .filter(({ icon }) => icon !== hackathonTeam)
              .map(({ icon, text }, index) => (
                <HackathonParam key={index}>
                  <SIcon src={icon} alt={text} />
                  <SubTitle level={"2"} weight="3">
                    {text}
                  </SubTitle>
                </HackathonParam>
              ))}
          </HackathonParams>
        </SHackathonInfo>
      </SHackathonCard>
    );
  }
  return (
    <SHackathonCard key={hackathon.id}>
      <SHackathonImage>
        {hackathon.imageLink ? (
          <SImage src={hackathon.imageLink} alt={hackathon.name} />
        ) : (
          <SImage src={defaultImage} alt={"Hackathon"} />
        )}
      </SHackathonImage>
      <SHackathonInfo>
        <STitle weight="2">{hackathon.name}</STitle>
        <HackathonParams>
          {hackathonParams.map(({ icon, text }, index) => (
            <HackathonParam key={index}>
              <SIcon src={icon} alt={text} />
              <SubTitle level={"2"} weight="3">
                {text}
              </SubTitle>
            </HackathonParam>
          ))}
        </HackathonParams>
        <ButtonContainer>
          <SInlineButtons mode="plain">
            <SIcon src={shareIcon} />
          </SInlineButtons>
        </ButtonContainer>
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
  border-radius: 1rem;
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

const SIcon = styled.img``;

const ButtonContainer = styled.div`
  position: absolute;
  bottom: 0px;
  right: 0px;
`;

const SInlineButtons = styled(InlineButtons.Item)`
  padding: 0.75rem 0.625rem;
  min-height: auto;
  min-width: auto;
`