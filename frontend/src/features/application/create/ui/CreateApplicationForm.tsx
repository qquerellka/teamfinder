import type { FC } from 'react';
import { ApplicationFormView } from '../../_shared/ui/ApplicationFormView';
import { useCreateApplicationForm } from '../model/useCreateApplicationForm';

export const CreateApplicationForm: FC<{
  hackathonId: number;
  hackathonName: string;
  onDone?: () => void;
}> = ({ hackathonId, hackathonName, onDone }) => {
  const form = useCreateApplicationForm({ hackathonId, onDone });

  return (
    <ApplicationFormView
      hackathonName={hackathonName}
      role={form.role}
      submitLabel="Создать анкету"
      loading={form.isSaving}
      canSubmit={form.canSubmit}
      onRoleChange={form.setRole}
      onSubmit={form.submit}
    />
  );
};
