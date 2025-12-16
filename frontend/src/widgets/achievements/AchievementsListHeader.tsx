import { paths } from "@/shared/routing/paths";
import { SIcon } from "@/shared/ui/SIcon";
import { SText } from "@/shared/ui";
import { IconButton } from "@telegram-apps/telegram-ui";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FC } from "react";

interface AchievementsListHeaderProps {
  showAdd: boolean;
}

export const AchievementsListHeader: FC<AchievementsListHeaderProps> = ({
  showAdd,
}) => {
  const navigate = useNavigate();
  return (
    <HeaderRow>
      <SText
        $fs={15}
        $fw={600}
        style={{
          color: "var(--tg-theme-section-header-text-color)",
          textAlign: "left",
        }}
      >
        Достижения
      </SText>
      {showAdd && (
        <IconButton
          size="m"
          onClick={() => navigate(paths.userAchievementsRoot)}
        >
          <SIcon name={"plus"} />
        </IconButton>
      )}
    </HeaderRow>
  );
};

const HeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  width: 100%;
  padding: 0 0;
`;
