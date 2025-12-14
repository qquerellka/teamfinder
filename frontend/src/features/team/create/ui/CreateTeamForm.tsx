import type { FC } from "react";

import type { Hackathon } from "@/entities/hackathon";
import { useCreateTeam } from "@/entities/team/api/hooks";
import { TeamFormView } from "../../_shared/ui/TeamFormView";
import { useCreateTeamForm } from "../model/useCreateTeamForm";
import { Role } from "@/shared/types/enums";

export const CreateTeamForm: FC<{ hackathon: Hackathon; onDone?: () => void }> = ({
  hackathon,
  onDone,
}) => {
  const createMutation = useCreateTeam(hackathon.id);
  const form = useCreateTeamForm();

  const submit = async () => {
    if (!form.canSubmit) return;
    await createMutation.mutateAsync({
      role: form.role as Role,
      name: form.name,
      description: form.description,
    });
    onDone?.();
  };

  return (
    <TeamFormView
      mode="create"
      hackathonName={hackathon.name}
      name={form.name}
      description={form.description}
      role={form.role}
      onRoleChange={form.setRole}
      onNameChange={form.setName}
      onDescriptionChange={form.setDescription}
      submitLabel="Создать"
      canSubmit={form.canSubmit}
      loading={createMutation.isPending}
      onSubmit={submit}
    />
  );
};
