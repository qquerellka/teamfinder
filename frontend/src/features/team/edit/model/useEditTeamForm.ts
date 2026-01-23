import { useState } from 'react';

export function useEditTeamForm(initial: { name: string; description: string }) {
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);

  const canSubmit = Boolean(name.trim()) && Boolean(description.trim());

  return { name, description, setName, setDescription, canSubmit };
}
