import { ChangeEvent, useState } from "react";
import type { Role } from "@/shared/types/enums";

interface UseHackathonApplicationFormParams {
  initialRole: Role | "";
  onSubmit: (role: Role) => Promise<unknown> | unknown;
}

export function useHackathonApplicationForm({
  initialRole,
  onSubmit,
}: UseHackathonApplicationFormParams) {
  const [role, setRole] = useState<Role | "">(initialRole);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as Role | "");
  };

  const canSubmit = Boolean(role) && !isSubmitting;

  const handleSave = async () => {
    if (!role || !canSubmit) return;

    try {
      setIsSubmitting(true);
      await onSubmit(role);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    role,
    handleRoleChange,
    handleSave,
    isSubmitting,
    canSubmit,
  };
}
