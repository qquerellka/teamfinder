import { Role } from "@/shared/types/enums";
import { ChangeEvent, useState } from "react";

interface UseHackathonTeamFormProps {
  onSubmit: (
    role: Role,
    name: string,
    description: string
  ) => Promise<unknown> | unknown;
}

export function useCreateTeamForm({
  onSubmit,
}: UseHackathonTeamFormProps) {


  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [role, setRole] = useState<Role | "">("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as Role | "");
  };

  const canSubmit = Boolean(role) && Boolean(name) && Boolean(description);

  const handleSave = async () => {
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);
      await onSubmit(role as Role, name, description);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    role,
    name,
    description,
    handleNameChange,
    handleDescriptionChange,
    handleRoleChange,
    handleSave,
    canSubmit,
    isSubmitting,
  };
}
