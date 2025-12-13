import styled from "styled-components";
import { Button } from "@telegram-apps/telegram-ui";

import { Hackathon } from "@/entities/hackathon";
import type { Application } from "@/entities/application";
import { formatRegistrationDate } from "@/shared/helpers/date";


import { FC } from "react";
import { useHackathonApplicationDelete } from "../hooks/useHackathonApplicationDelete";
import { useNavigate } from "react-router-dom";
import { RoleBadge, SIcon, SText } from "@/shared/ui";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";

interface HackathonApplicationCardProps {
  hackathon: Hackathon;
  application: Application;
  onEditClick?: () => void;
}

export const HackathonApplicationCard: FC<HackathonApplicationCardProps> = ({
  hackathon,
  application,
  onEditClick,
}) => {
  const navigate = useNavigate();
  const {
    isOpen: isDeleteModalOpen,
    open: openDeleteModal,
    cancel: cancelDelete,
    confirm: confirmDelete,
    isLoading: isDeleting,
  } = useHackathonApplicationDelete({
    hackathonId: hackathon.id,
    applicationId: application.id,
    onDeleted: () => navigate(-1),
  });
  return (
    <>
      <Wrapper>
        <Header>
          <SText $fs={16} $fw={600}>
            {hackathon.name}
          </SText>

          <Icons>
            <IconButton type="button" onClick={onEditClick}>
              <SIcon name={"edit"} />
            </IconButton>
            <IconButton type="button" onClick={openDeleteModal}>
              <SIcon name={"delete"} />
            </IconButton>
          </Icons>
        </Header>

        <SText $fs={14} $fw={500}>
          {formatRegistrationDate(hackathon.registrationEndDate)}
        </SText>

        <RoleBadge role={application.role} />
      </Wrapper>

      <ConfirmModal
        open={isDeleteModalOpen}
        title="Удалить анкету?"
        confirmText="Удалить"
        cancelText="Отмена"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
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
