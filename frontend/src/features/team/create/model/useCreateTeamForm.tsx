import { useState } from 'react';
import type { Role } from '@/shared/types/enums';

export function useCreateTeamForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState<Role | ''>('');

  const canSubmit = Boolean(name.trim()) && Boolean(description.trim()) && Boolean(role);

  return {
    name,
    description,
    role,
    setName,
    setDescription,
    setRole,
    canSubmit,
  };
}
