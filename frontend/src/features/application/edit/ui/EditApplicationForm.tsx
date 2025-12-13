import type { FC } from "react";
import type { Application } from "@/entities/application";
import { ApplicationFormView } from "../../_shared/ui/ApplicationFormView";
import { useEditApplicationForm } from "../model/useEditApplicationForm";

export const EditApplicationForm: FC<{
  hackathonName: string;
  application: Application;
  onCancel: () => void;
}> = ({ hackathonName, application, onCancel }) => {
  const form = useEditApplicationForm({
    application,
    onDone: onCancel,
  });

  return (
    <ApplicationFormView
      hackathonName={hackathonName}
      role={form.role}
      submitLabel="Сохранить"
      loading={form.isSaving}
      canSubmit={form.canSubmit}
      onRoleChange={form.setRole}
      onSubmit={form.submit}
      onCancel={onCancel}
    />
  );
};
