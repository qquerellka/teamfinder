import { FC } from "react";

import { Hackathon } from "@/entities/hackathon/model/types";
import { HackathonTeamForm } from "./HackathonTeamForm";
import { useCreateTeam } from "@/entities/team/api/hooks";
import { useCreateTeamForm } from "../hooks/useCreateTeamForm";

interface HackathonTeamCreateFormProps {
  hackathon: Hackathon;
}

export const CreateTeamForm: FC<
  HackathonTeamCreateFormProps
> = ({ hackathon }) => {
  const createMutation = useCreateTeam(hackathon.id);

  const { role, name, description, handleRoleChange, handleNameChange, handleDescriptionChange, handleSave, isSubmitting, canSubmit } =
    useCreateTeamForm({
      onSubmit: (role, name, description) => createMutation.mutateAsync({ role, name, description }),
    });

  return (
    <HackathonTeamForm
      hackathon={hackathon}
      role={role}
      name={name}
      description={description}
      submitLabel="Создать команду"
      loading={isSubmitting}
      canSubmit={canSubmit}
      onRoleChange={handleRoleChange}
      onNameChange={handleNameChange}
      onDescriptionChange={handleDescriptionChange}
      onSubmit={handleSave}
    />
  );
};
