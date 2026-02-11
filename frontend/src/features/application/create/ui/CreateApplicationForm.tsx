import type { FC } from 'react';
import { ApplicationFormView } from '../../_shared/ui/ApplicationFormView';
import { useCreateApplicationForm } from '../model/useCreateApplicationForm';

export const CreateApplicationForm: FC<{
  hackathonId: number;
  hackathonName: string;
  onDone?: () => void;
}> = ({ hackathonId, hackathonName, onDone }) => {
  const { role, isSaving, canSubmit, setRole, submit } = useCreateApplicationForm({
    hackathonId,
    onDone,
  });

  return (
    <ApplicationFormView
      hackathonName={hackathonName}
      role={role}
      submitLabel="Создать анкету"
      loading={isSaving}
      canSubmit={canSubmit}
      onRoleChange={setRole}
      onSubmit={submit}
    />
  );
};
