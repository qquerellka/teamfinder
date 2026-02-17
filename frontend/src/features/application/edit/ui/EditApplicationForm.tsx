import type { FC } from 'react';
import type { Application } from '@/entities/application';
import { ApplicationFormView } from '../../_shared/ui/ApplicationFormView';
import { useEditApplicationForm } from '../model/useEditApplicationForm';

export const EditApplicationForm: FC<{
  hackathonName: string;
  application: Application;
  onCancel: () => void;
}> = ({ hackathonName, application, onCancel }) => {
  const { role, isSaving, submit, canSubmit, setRole } = useEditApplicationForm({
    application,
    onDone: onCancel,
  });

  return (
    <ApplicationFormView
      hackathonName={hackathonName}
      role={role}
      submitLabel="Сохранить"
      loading={isSaving}
      canSubmit={canSubmit}
      onRoleChange={setRole}
      onSubmit={submit}
      onCancel={onCancel}
    />
  );
};
