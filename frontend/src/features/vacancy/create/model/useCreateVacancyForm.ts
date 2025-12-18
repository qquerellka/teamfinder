import { useState } from "react";
import type { Role } from "@/shared/types/enums";
import { useCreateVacancy } from "@/entities/vacancy";

export function useCreateVacancyForm(params: {
  teamId: number;
  onDone?: () => void;
}) {
  const createMutation = useCreateVacancy(params.teamId);
  const [role, setRole] = useState<Role | "">("");
  const [description, setDescription] = useState<string>("");

  const canSubmit = Boolean(role) && Boolean(description) && !createMutation.isPending;

  const submit = async () => {
    if (!role || !description || !canSubmit) return;
    await createMutation.mutateAsync({ role, description });
    params.onDone?.();
  };

  return {
    role,
    description,
    setRole,
    setDescription,
    canSubmit,
    isSaving: createMutation.isPending,
    submit,
  };
}
