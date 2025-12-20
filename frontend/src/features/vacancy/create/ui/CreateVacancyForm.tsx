import type { FC } from "react";
import { VacancyFormView } from "../../_shared/ui/VacancyFormView";
import { useCreateVacancyForm } from "../model/useCreateVacancyForm";

export const CreateVacancyForm: FC<{
  teamId: number;
  onDone?: () => void;
}> = ({ teamId, onDone }) => {
  const form = useCreateVacancyForm({ teamId, onDone });

  return (
    <VacancyFormView
      role={form.role}
      submitLabel="Создать анкету"
      loading={form.isSaving}
      canSubmit={form.canSubmit}
      onRoleChange={form.setRole}
      onSubmit={form.submit}
      description={form.description}
      onDescriptionChange={form.setDescription}
    />
  );
};
