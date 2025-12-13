import { useEffect, useState } from "react";
import type { Role } from "@/shared/types/enums";
import type { Application } from "@/entities/application";
import { useEditAuthUserApplication } from "@/entities/application";

export function useEditApplicationForm(params: {
  application: Application;
  onDone?: () => void;
}) {
  const editMutation = useEditAuthUserApplication();
  const [role, setRole] = useState<Role | "">("");

  useEffect(() => {
    setRole(params.application.role ?? "");
  }, [params.application]);

  const canSubmit = Boolean(role) && !editMutation.isPending;

  const submit = async () => {
    if (!role || !canSubmit) return;
    await editMutation.mutateAsync({
      id: params.application.id,
      payload: { role },
    });
    params.onDone?.();
  };

  return {
    role,
    setRole,
    canSubmit,
    isSaving: editMutation.isPending,
    submit,
  };
}
