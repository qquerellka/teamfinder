import { FC } from "react";

import { Hackathon } from "@/entities/hackathon/model/types";
import { useCreateHackathonApplication } from "@/entities/application/api/hooks";
import { HackathonApplicationForm } from "./HackathonApplicationForm";
import { useHackathonApplicationForm } from "../hooks/useHacakthonApplicationForm";

interface HackathonApplicationCreateFormProps {
  hackathon: Hackathon;
}

export const HackathonApplicationCreateForm: FC<
  HackathonApplicationCreateFormProps
> = ({ hackathon }) => {
  const createMutation = useCreateHackathonApplication(hackathon.id);

  const { role, handleRoleChange, handleSave, isSubmitting, canSubmit } =
    useHackathonApplicationForm({
      initialRole: "",
      onSubmit: (role) => createMutation.mutateAsync({ role }),
    });

  return (
    <HackathonApplicationForm
      hackathon={hackathon}
      role={role}
      submitLabel="Создать анкету"
      loading={isSubmitting}
      canSubmit={canSubmit}
      onRoleChange={handleRoleChange}
      onSubmit={handleSave}
    />
  );
};
