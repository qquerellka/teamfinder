import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { IconButton, List, Section } from "@telegram-apps/telegram-ui";

import { STitle } from "@/shared/ui/STitle";
import { SIcon } from "@/shared/ui/SIcon";
import plusIcon from "@/assets/icons/plusIcon.svg";
import { useAuthUser } from "@/entities/user/api/hooks";
import { AchievementItem } from "@/widgets/achievements/AchievementItem";
import { paths } from "@/app/routing/paths";

export const ProfileAchievementsSection = () => {
  const navigate = useNavigate();
  const { data: user } = useAuthUser();

  return (
    <SSection
      header={
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
            onClick={() => navigate(paths.profileAchievement("new"))}
          >
            <SIcon icon={plusIcon} />
          </IconButton>
        </HeaderRow>
      }
    >
      <List>
        {user?.achievements?.map((a) => (
          <AchievementItem key={a.id} achievement={a} />
        ))}
      </List>
    </SSection>
  );
};


const SSection = styled(Section)`
  background: var(--tg-theme-section-bg-color, #fff);
  padding: 1rem;
  border-radius: 1rem;
  & > div {
    display: flex;
    flex-direction: column;

    & > header {
      padding: 0;
      box-shadow: none;
    }
    & > div {
      padding: 0;
      & > div {
        background: var(--tg-theme-section-bg-color, #fff);
        padding: 1rem 0 1rem 0;
      }
    }
  }
  & > footer {
    padding-bottom: 0;
    & > h6 {
      color: var(--tg-theme-destructive-text-color, #fff);
    }
  }
`;

const HeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
