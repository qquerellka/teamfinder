import { paths } from "@/app/routing/paths";
import { SIcon } from "@/shared/ui/SIcon";
import { STitle } from "@/shared/ui/STitle";
import { IconButton } from "@telegram-apps/telegram-ui";
import plusIcon from "@/assets/icons/plusIcon.svg?react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

export const AchievementsListHeader = () => {
  const navigate = useNavigate();
  return (
    <HeaderRow>
      <STitle
        $fs={15}
        $fw={600}
        style={{ color: "var(--tg-theme-section-header-text-color)" }}
      >
        Достижения
      </STitle>
      <IconButton
        size="m"
        onClick={() => navigate(paths.profileAchievementsRoot)}
      >
        <SIcon icon={plusIcon} />
      </IconButton>
    </HeaderRow>
  );
};

const HeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 22px;
`;
