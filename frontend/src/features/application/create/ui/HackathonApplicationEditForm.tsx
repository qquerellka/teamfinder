import { FC } from "react";
import { Hackathon } from "@/entities/hackathon/model/types";
import type { Application } from "@/entities/application/model/types";
import type { Role } from "@/shared/types/enums";
import {
  useEditAuthUserApplication,
  useDeleteAuthUserApplication,
} from "@/entities/application/api/hooks";
import { HackathonApplicationForm } from "./HackathonApplicationForm";

interface HackathonApplicationEditFormProps {
  hackathon: Hackathon;
  application: Application;
  onClose: () => void;
}

export const HackathonApplicationEditForm: FC<
  HackathonApplicationEditFormProps
> = ({ hackathon, application, onClose }) => {
  const editMutation = useEditAuthUserApplication();
  const deleteMutation = useDeleteAuthUserApplication();

  const handleSubmit = async (role: Role) => {
    await editMutation.mutateAsync({
      id: application.id,
      payload: { role },
    });
    onClose();
  };


  return (
      <HackathonApplicationForm
        hackathon={hackathon}
        initialRole={application.role}
        submitLabel="Сохранить"
        loading={editMutation.isPending || deleteMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
  );
};
