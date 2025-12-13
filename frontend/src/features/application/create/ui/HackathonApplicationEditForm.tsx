import { FC } from "react";

import { Hackathon } from "@/entities/hackathon/model/types";
import type { Application } from "@/entities/application/model/types";
import { useEditAuthUserApplication } from "@/entities/application/api/hooks";
import { HackathonApplicationForm } from "./HackathonApplicationForm";
import { useHackathonApplicationForm } from "../hooks/useHacakthonApplicationForm";

interface HackathonApplicationEditFormProps {
  hackathon: Hackathon;
  application: Application;
  onClose: () => void;
}

export const HackathonApplicationEditForm: FC<
  HackathonApplicationEditFormProps
> = ({ hackathon, application, onClose }) => {
  const editMutation = useEditAuthUserApplication();

  const { role, handleRoleChange, handleSave, isSubmitting, canSubmit } =
    useHackathonApplicationForm({
      initialRole: application.role,
      onSubmit: (role) =>
        editMutation
          .mutateAsync({
            id: application.id,
            payload: { role },
          })
          .then(() => {
            onClose();
          }),
    });

  return (
    <HackathonApplicationForm
      hackathon={hackathon}
      role={role}
      submitLabel="Сохранить"
      loading={isSubmitting}
      canSubmit={canSubmit}
      onRoleChange={handleRoleChange}
      onSubmit={handleSave}
      onCancel={onClose}
    />
  );
};
