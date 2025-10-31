import { FC } from "react";
import styled from "styled-components";
import { Card, Title, Cell, Image } from "@telegram-apps/telegram-ui";
import hackathonImage2 from "../../assets/hackathonImage8.webp";
import hackathonImage1 from "../../assets/hackathonImage7.webp";
import hackathonImage3 from "../../assets/hackathonImage6.webp";
import hackathonImage4 from "../../assets/hackathonImage4.webp";
import hackathonImage5 from "../../assets/hackathonImage9.png";

import hackathonPrizeIcon from "../../assets/icons/hackathonCard/hackathonPrizeIcon.svg";
import hackathonDate from "../../assets/icons/hackathonCard/hackathonDateIcon.svg";
import hackathonPlace from "../../assets/icons/hackathonCard/hackathonPlaceIcon.svg";
import hackathonRegistration from "../../assets/icons/hackathonCard/hackathonRegistrationIcon.svg";

import { Hackathon } from "@/shared/types/hackathon";
import { formatDateRange, formatRegistrationDate } from "@/shared/helpers/date";

const images = [
  hackathonImage1,
  hackathonImage2,
  hackathonImage3,
  hackathonImage4,
  hackathonImage5,
];

export const HackathonCard: FC<Hackathon> = ({
  id,
  name,
  startDate,
  endDate,
  registrationEndDate,
  city,
  mode,
  prizeFund,
}) => {
  const hackathonParams = [
    {
      icon: hackathonDate,
      text: formatDateRange(startDate, endDate),
    },
    {
      icon: hackathonRegistration,
      text: formatRegistrationDate(registrationEndDate),
    },
    {
      icon: hackathonPlace,
      text: `${city} • ${mode}`,
    },
    {
      icon: hackathonPrizeIcon,
      text: prizeFund.toLocaleString(), // Печать числа с разделителями
    },
  ];

  return (
    <HackCard key={id}>
      <Poster>
        <img src={images[id % 5]} alt={name} />
      </Poster>
      <Info>
        <Title weight="1">{name}</Title>
        {hackathonParams.map(({ icon, text }, index) => (
          <HackathonCardParam key={index}>
            <img src={icon} alt={text} />
            <SubTitle level={"2"} weight="3">
              {text}
            </SubTitle>
          </HackathonCardParam>
        ))}
      </Info>
    </HackCard>
  );
};

const HackCard = styled(Card)`
  background: var(--tg-theme-secondary-bg-color, #fff);
  border-radius: 1rem;
  padding: 0.5rem 0.5rem 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1); /* Улучшение внешнего вида */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const Poster = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.25));
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 40%,
      rgba(0, 0, 0, 0.25) 100%
    );
    pointer-events: none;
  }
`;

const Info = styled.div``;

const SubTitle = styled(Title)`
  color: var(--tg-theme-hint-color, #8e8e93);
  font-size: 1rem;
`;

const HackathonCardParam = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 8px;
`;

