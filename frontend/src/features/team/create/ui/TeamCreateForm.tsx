import { FC } from "react";

import { Hackathon } from "@/entities/hackathon/model/types";
// import { HackathonTeamForm } from "./HackathonTeamForm";
import { useCreateTeam } from "@/entities/team/api/hooks";
import { useCreateTeamForm } from "../hooks/useCreateTeamForm";
import { InputSection } from "@/shared/ui";
import { Button, Input, Select } from "@telegram-apps/telegram-ui";
import { roleOptions } from "@/shared/types/enums";
import styled from "styled-components";

interface HackathonTeamCreateFormProps {
  hackathon: Hackathon;
}

export const CreateTeamForm: FC<HackathonTeamCreateFormProps> = ({
  hackathon,
}) => {
  const createMutation = useCreateTeam(hackathon.id);

  const {
    role,
    name,
    description,
    handleRoleChange,
    handleNameChange,
    handleDescriptionChange,
    handleSave,
    isSubmitting,
    canSubmit,
  } = useCreateTeamForm({
    onSubmit: (role, name, description) =>
      createMutation.mutateAsync({ role, name, description }),
  });
  const handleSaveClick = () => {
    if (!canSubmit) return;
    handleSave();
  };

  return (
    <SExtraInfo>
      <InputSection header={"Хакатон"}>
        <Input type="text" value={hackathon.name} disabled />
      </InputSection>
      <InputSection header={"Название команды"}>
        <Input type="text" value={name} onChange={handleNameChange} />{" "}
      </InputSection>

      <InputSection header={"Описание команды"}>
        <Input
          type="text"
          value={description}
          onChange={handleDescriptionChange}
        />
      </InputSection>

      <InputSection header={"Ваша роль"}>
        <Select value={role} onChange={handleRoleChange}>
          <option value="" disabled>
            Выберите роль
          </option>
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </InputSection>

      <ButtonsSection>
        <Button
          size="l"
          onClick={handleSaveClick}
          stretched
          disabled={!canSubmit || isSubmitting}
        >
          {"Создать"}
        </Button>
      </ButtonsSection>
    </SExtraInfo>
    // <HackathonTeamForm
    //   hackathon={hackathon}
    //   role={role}
    //   name={name}
    //   description={description}
    //   submitLabel="Создать команду"
    //   loading={isSubmitting}
    //   canSubmit={canSubmit}
    //   onRoleChange={handleRoleChange}
    //   onNameChange={handleNameChange}
    //   onDescriptionChange={handleDescriptionChange}
    //   onSubmit={handleSave}
    // />
  );
};
const ButtonsSection = styled.div`
  margin-top: auto;
  padding-bottom: env(safe-area-inset-bottom, 0);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
const SExtraInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.5rem;
`;