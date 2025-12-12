import { FC } from "react";

import { Hackathon } from "@/entities/hackathon/model/types";
import { TeamWithMembers } from "@/entities/team/model/types";
import { useEditTeamForm } from "../hooks/useEditTeamForm";
import { useEditTeam } from "@/entities/team/api/hooks";
// import { HackathonTeamForm } from "./HackathonTeamForm";
import { InputSection, SIcon, STitle } from "@/shared/ui";
import { Button, Input, Textarea } from "@telegram-apps/telegram-ui";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import deleteIcon from "@/assets/icons/deleteIcon.svg?react";
import leaveTeamIcon from "@/assets/icons/leaveTeamIcon.svg?react";
import { TeamMemberCard } from "./TeamCard";
import profileIcon from "@/assets/icons/navbarIcons/ProfileIcon.svg?react";
import { useDeleteTeamForm } from "../hooks/useDeleteTeamFrom";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import { useLeaveTeam } from "@/entities/teamMember/api/hooks";

interface TeamEditFormProps {
  hackathon: Hackathon;
  team: TeamWithMembers;
  onClose: () => void;
}

export const TeamEditForm: FC<TeamEditFormProps> = ({
  hackathon,
  team,
  onClose,
}) => {
  const editMutation = useEditTeam();

  const navigate = useNavigate();
  const {
    name,
    description,
    handleNameChange,
    handleDescriptionChange,
    handleSave,
    isSubmitting,
    canSubmit,
  } = useEditTeamForm({
    initialName: team?.name ?? "",
    initialDescription: team?.description ?? "",
    onSubmit: (name: string, description: string) =>
      editMutation
        .mutateAsync({
          id: team.id,
          payload: { name, description },
        })
        .then(() => {
          onClose();
        }),
  });
  const handleSaveClick = () => {
    if (!canSubmit) return;
    handleSave();
  };

  const onCancel = () => {
    navigate(-1);
  };
  const {
    isOpen: isDeleteModalOpen,
    open: openDeleteModal,
    cancel: cancelDelete,
    confirm: confirmDelete,
    isLoading: isDeleting,
  } = useDeleteTeamForm({
    hackathonId: hackathon.id,
    teamId: team.id,
    onDeleted: () => navigate(-1),
  });
    const leaveMutaion = useLeaveTeam(team.id);
  
    const onLeaveTeam = async () => {
       await leaveMutaion.mutateAsync();
       navigate(-1);
    }


  return (
    <>
      <SExtraInfo>
        <Header>
          <SIcon onClick={openDeleteModal} icon={deleteIcon}></SIcon>
          <STitle $fs={14} $fw={500}>
            {"Моя команда"}
          </STitle>
          <SIcon onClick={onLeaveTeam} icon={leaveTeamIcon}></SIcon>
        </Header>
        <InputSection header={"Хакатон"}>
          <Input type="text" value={hackathon.name} disabled />
        </InputSection>
        <InputSection header={"Название"}>
          <Input type="text" value={name} onChange={handleNameChange} />
        </InputSection>
        <InputSection header={"Описание"}>
          <Textarea value={description} onChange={handleDescriptionChange} />
        </InputSection>
        <TeamMembers>
          <HeaderRow>
            <STitle
              $fs={16}
              $fw={600}
              style={{ color: "var(--tg-theme-section-header-text-color)" }}
            >
              Участники
            </STitle>
            <CountTeamMembers className="">
              <SIcon icon={profileIcon} />
              <STitle $fs={16} $fw={700}>
                {team.members.length} / {hackathon.teamMembersLimit}
              </STitle>
            </CountTeamMembers>
          </HeaderRow>
          <TeamMemberCards className="">
            {team?.members?.map((m) => (
              <TeamMemberCard key={m.user.id} member={m} team={team}/>
            ))}
          </TeamMemberCards>
        </TeamMembers>
        <ButtonsSection>
          <Button
            size="l"
            onClick={handleSaveClick}
            stretched
            disabled={!canSubmit || isSubmitting}
          >
            {"Изменить команду"}
          </Button>
          {onCancel && (
            <Button
              size="l"
              mode="bezeled"
              stretched
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
          )}
        </ButtonsSection>
        {/* <HackathonTeamForm
        hackathon={hackathon}
        name={name}
        description={description}
        submitLabel="Создать команду"
        loading={isSubmitting}
        canSubmit={canSubmit}
        onNameChange={handleNameChange}
        onDescriptionChange={handleDescriptionChange}
        onSubmit={handleSave}
      /> */}
      </SExtraInfo>
      <ConfirmModal
        open={isDeleteModalOpen}
        title="Удалить команду?"
        confirmText="Удалить"
        cancelText="Отмена"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
};

const ButtonsSection = styled.div`
  margin-top: auto;
  padding-bottom: env(safe-area-inset-bottom, 0);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
const SExtraInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.5rem;
`;

const HeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 22px;
  margin-bottom: 1rem;
`;

const TeamMembers = styled.div`
  display: flex;
  flex-direction: column;
`;

const CountTeamMembers = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
`;

const TeamMemberCards = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;
