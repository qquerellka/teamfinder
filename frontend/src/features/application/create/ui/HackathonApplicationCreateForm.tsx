import { FC } from "react";
import { Hackathon } from "@/entities/hackathon/model/types";
import type { Role } from "@/shared/types/enums";
import { useCreateHackathonApplication } from "@/entities/application/api/hooks";
import { HackathonApplicationForm } from "./HackathonApplicationForm";

interface HackathonApplicationCreateFormProps {
  hackathon: Hackathon;
}

export const HackathonApplicationCreateForm: FC<
  HackathonApplicationCreateFormProps
> = ({ hackathon }) => {
  const { mutateAsync, isPending } = useCreateHackathonApplication(hackathon.id);

  const handleSubmit = async (role: Role) => {
    await mutateAsync({ role });
  };

  return (
    <HackathonApplicationForm
      hackathon={hackathon}
      initialRole=""
      submitLabel="Создать анкету"
      loading={isPending}
      onSubmit={handleSubmit}
    />
  );
};
