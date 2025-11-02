import { FC } from "react";
import styled from "styled-components";
import { Card, Title } from "@telegram-apps/telegram-ui";
import hackathonImage2 from "../../assets/hackathonImage8.webp";
// import hackathonImage1 from "../../assets/hackathonImage7.webp";
import hackathonImage3 from "../../assets/hackathonImage6.webp";
import hackathonImage4 from "../../assets/hackathonImage4.webp";
import hackathonImage5 from "../../assets/hackathonImage9.png";
import imga from "../../assets/download.jpeg"
import hackathonPrizeIcon from "../../assets/icons/hackathonCard/hackathonPrizeIcon.svg";
import hackathonDate from "../../assets/icons/hackathonCard/hackathonDateIcon.svg";
import hackathonPlace from "../../assets/icons/hackathonCard/hackathonPlaceIcon.svg";
import hackathonRegistration from "../../assets/icons/hackathonCard/hackathonRegistrationIcon.svg";

import { Hackathon } from "@/shared/types/hackathon";
import { formatDateRange, formatRegistrationDate } from "@/shared/helpers/date";

const images = [
  imga,
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
      text: prizeFund.toLocaleString(),
    },
  ];

  return (
    <HackCard key={id}>
      <Poster>
        <img src={images[id % 5]} alt={name} />
      </Poster>
      <Info>
        <Title weight="2">{name}</Title>
        <HackathonCardParams>
          {hackathonParams.map(({ icon, text }, index) => (
            <HackathonCardParam key={index}>
              <img src={icon} alt={text} />
              <SubTitle level={"2"} weight="3">
                {text}
              </SubTitle>
            </HackathonCardParam>
          ))}
        </HackathonCardParams>
      </Info>
    </HackCard>
  );
};

const HackCard = styled(Card)`
  background: var(--tg-theme-section-bg-color, #fff);
  border-radius: 1rem;
  padding: 0.5rem 0.5rem 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
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

const Info = styled.div`
  margin: 0 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SubTitle = styled(Title)`
  color: var(--tg-theme-hint-color, #8e8e93);
  font-size: 1rem;
  line-height: normal;
`;

const HackathonCardParam = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
`;

const HackathonCardParams = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
