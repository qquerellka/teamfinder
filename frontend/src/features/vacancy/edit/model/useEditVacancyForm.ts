import { useEffect, useState } from 'react';
import type { Role } from '@/shared/types/enums';
import { useEditVacancy, Vacancy } from '@/entities/vacancy';

export function useEditVacancyForm(params: { vacancy: Vacancy; onDone?: () => void }) {
  const editMutation = useEditVacancy();
  const [role, setRole] = useState<Role | ''>('');
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    setRole(params.vacancy.role ?? '');
    setDescription(params.vacancy.description ?? '');
  }, [params.vacancy]);

  const canSubmit = Boolean(role) && Boolean(description) && !editMutation.isPending;

  const submit = async () => {
    if (!role || !description || !canSubmit) return;
    await editMutation.mutateAsync({
      id: params.vacancy.id,
      payload: { role, description },
    });
    params.onDone?.();
  };

  return {
    role,
    description,
    setDescription,
    setRole,
    canSubmit,
    isSaving: editMutation.isPending,
    submit,
  };
}
