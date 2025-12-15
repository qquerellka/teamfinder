import { paths } from "@/shared/routing/paths";
import { SIcon } from "@/shared/ui/SIcon";
import { SText } from "@/shared/ui";
import { IconButton } from "@telegram-apps/telegram-ui";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

export const AchievementsListHeader = () => {
  const navigate = useNavigate();
  return (
    <HeaderRow>
      <SText
        $fs={15}
        $fw={600}
        style={{ color: "var(--tg-theme-section-header-text-color)" }}
      >
        Достижения
      </SText>
      <IconButton
        size="m"
        onClick={() => navigate(paths.userAchievementsRoot)}
      >
        <SIcon name={"plus"} />
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
