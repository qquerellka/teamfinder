import {useState } from "react";

interface UseHackathonTeamFormProps {
  initialName: string;
  initialDescription: string;
  onSubmit: (
    name: string,
    description: string
  ) => Promise<unknown> | unknown;
}

export function useEditTeamForm({
  initialName,
  initialDescription,
  onSubmit,
}: UseHackathonTeamFormProps) {
  const [name, setName] = useState<string>(initialName);
  const [description, setDescription] = useState<string>(initialDescription);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const canSubmit = Boolean(name) && Boolean(description);

  const handleSave = async () => {
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);
      await onSubmit(name, description);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    description,
    handleNameChange,
    handleDescriptionChange,
    handleSave,
    canSubmit,
    isSubmitting,
  };
}

