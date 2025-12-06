import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Role } from "@/shared/types/enums";
import { useCreateHackathonApplication } from "@/entities/application/api/hooks";

export function useHackathonApplicationCreateForm(hackathonId: number) {
  const navigate = useNavigate();
  const createApplicationMutation = useCreateHackathonApplication(hackathonId);

  const [role, setRole] = useState<Role | "">("");

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as Role | "");
  };

  const canSubmit = !!role;
  const isSubmitting = createApplicationMutation.isPending;

  const handleSave = () => {
    if (!canSubmit || !role) return;

    createApplicationMutation.mutate(
      { role },
      { onSuccess: () => navigate(-1) }
    );
  };

  return {
    role,
    handleRoleChange,
    handleSave,
    canSubmit,
    isSubmitting,
  };
}
