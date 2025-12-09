import styled from "styled-components";
import { Button } from "@telegram-apps/telegram-ui";

import { Hackathon } from "@/entities/hackathon/model/types";
import type { Application } from "@/entities/application/model/types";
import { formatRegistrationDate } from "@/shared/helpers/date";
import { SIcon } from "@/shared/ui/SIcon";
import { RoleBadge } from "@/shared/ui/RoleBadge";
import { SText } from "@/shared/ui/SText";

import editIcon from "@/assets/icons/editIcon.svg";
import deleteIcon from "@/assets/icons/deleteIcon.svg";
import { FC } from "react";

interface HackathonApplicationCardProps {
  hackathon: Hackathon;
  application: Application;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
};

export const HackathonApplicationCard:FC<HackathonApplicationCardProps> = ({
  hackathon,
  application,
  onEditClick,
  onDeleteClick,
}) => {
  return (
    <Wrapper>
      <Header>
        <SText $fs={16} $fw={600}>
          {hackathon.name}
        </SText>

        <Icons>
          <IconButton type="button" onClick={onEditClick}>
            <SIcon icon={editIcon} />
          </IconButton>
          <IconButton type="button" onClick={onDeleteClick}>
            <SIcon icon={deleteIcon} />
          </IconButton>
        </Icons>
      </Header>

      <SText $fs={14} $fw={500}>{formatRegistrationDate(hackathon.registrationEndDate)}</SText>

      <RoleBadge role={application.role} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: var(--tg-theme-section-bg-color);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1rem;
  border-radius: 1rem;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const Icons = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
`;

const IconButton = styled(Button).attrs({ mode: "plain", size: "s" })`
  padding: 0;
  min-width: auto;
`;
