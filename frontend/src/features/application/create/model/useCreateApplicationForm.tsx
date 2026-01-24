import { useState } from 'react';
import type { Role } from '@/shared/types/enums';
import { useCreateHackathonApplication } from '@/entities/application';

export function useCreateApplicationForm(params: { hackathonId: number; onDone?: () => void }) {
  const createMutation = useCreateHackathonApplication(params.hackathonId);
  const [role, setRole] = useState<Role | ''>('');

  const canSubmit = Boolean(role) && !createMutation.isPending;

  const submit = async () => {
    if (!role || !canSubmit) return;
    await createMutation.mutateAsync({ role });
    params.onDone?.();
  };

  return {
    role,
    setRole,
    canSubmit,
    isSaving: createMutation.isPending,
    submit,
  };
}
