import { paths } from "@/app/routing/paths";
import { Achievement } from "@/entities/achievement/model/types";
import { formatHackPlace } from "@/shared/helpers/date";
import { SText } from "@/shared/ui/SText";
import { STitle } from "@/shared/ui/STitle";
import { Cell } from "@telegram-apps/telegram-ui";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

interface AchievementItemProps {
  achievement: Achievement;
}

export const AchievementItem: FC<AchievementItemProps> = ({ achievement }) => {
  const navigate = useNavigate();

  const handleAchievementClick = (id: number) => {
    // Вариант 1: абсолютный путь
    navigate(`${paths.profile}/achievements/${id}`);

    // или Вариант 2: относительный, если удобнее:
    // navigate(`achievements/${id}`, { relative: "path" });
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
      <STitle $fs={16} $fw={500}>
        {achievement.hackathonName}
      </STitle>
    </Wrapper>
  );
};

const Wrapper = styled(Cell)`
  background-color: var(--tg-theme-secondary-bg-color);
  border-radius: 1rem;
`;
