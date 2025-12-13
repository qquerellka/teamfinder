import { paths } from "@/shared/routing/paths";
import { Achievement } from "@/entities/achievement/model/types";
import { SText } from "@/shared/ui/SText";
import { Cell } from "@telegram-apps/telegram-ui";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { formatHackPlace } from "@/entities/achievement/lib/formatters";

interface AchievementItemProps {
  achievement: Achievement;
}

export const AchievementItem: FC<AchievementItemProps> = ({ achievement }) => {
  const navigate = useNavigate();

  const handleAchievementClick = (id: number) => {
    navigate(`${paths.profile}/achievements/${id}`);
  };
  return (
    <Wrapper
      onClick={() => handleAchievementClick(achievement.id)}
      after={
        <SText $fs={16} $fw={500}>
          {formatHackPlace(achievement.place)}
        </SText>
      }
    >
      <SText $fs={16} $fw={500}>
        {achievement.hackathonName}
      </SText>
    </Wrapper>
  );
};

const Wrapper = styled(Cell)`
  background-color: var(--tg-theme-section-bg-color);
  border-radius: 1rem;
`;
