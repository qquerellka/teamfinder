import { FC } from "react";

import { Hackathon } from "@/entities/hackathon/model/types";
import { HackathonTeamForm } from "./HackathonTeamForm";
import { useCreateTeam } from "@/entities/team/api/hooks";
import { useHackathonTeamForm } from "../hooks/useHackathonTeamForm";

interface HackathonTeamCreateFormProps {
  hackathon: Hackathon;
}

export const HackathonTeamCreateForm: FC<
  HackathonTeamCreateFormProps
> = ({ hackathon }) => {
  const createMutation = useCreateTeam(hackathon.id);

  const { role, name, description, handleRoleChange, handleNameChange, handleDescriptionChange, handleSave, isSubmitting, canSubmit } =
    useHackathonTeamForm({
      initialRole: "",
      initialName: "",
      initialDescription: "",
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
