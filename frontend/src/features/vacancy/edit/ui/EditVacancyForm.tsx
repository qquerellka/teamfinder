import type { FC } from 'react';
import { Vacancy } from '@/entities/vacancy';
import { useEditVacancyForm } from '../model/useEditVacancyForm';
import { VacancyFormView } from '../../_shared/ui/VacancyFormView';

export const EditVacancyForm: FC<{
  vacancy: Vacancy;
  onCancel: () => void;
}> = ({ vacancy, onCancel }) => {
  const form = useEditVacancyForm({
    vacancy,
    onDone: onCancel,
  });

  return (
    <VacancyFormView
      role={form.role}
      submitLabel="Сохранить"
      loading={form.isSaving}
      canSubmit={form.canSubmit}
      onRoleChange={form.setRole}
      onSubmit={form.submit}
      onCancel={onCancel}
      description={form.description}
      onDescriptionChange={form.setDescription}
    />
  );
};
