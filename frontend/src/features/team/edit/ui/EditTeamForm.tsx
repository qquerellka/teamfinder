import type { FC } from 'react';

import type { TeamWithMembers } from '@/entities/team';
import { useEditTeam } from '@/entities/team';
import { TeamFormView } from '../../_shared/ui/TeamFormView';
import { useEditTeamForm } from '../model/useEditTeamForm';

export const EditTeamForm: FC<{
  hackathonName: string;
  team: TeamWithMembers;
  onCancel: () => void;
  extra?: React.ReactNode;
}> = ({ hackathonName, team, onCancel, extra }) => {
  const editMutation = useEditTeam();
  const form = useEditTeamForm({
    name: team.name ?? '',
    description: team.description ?? '',
  });

  const submit = async () => {
    if (!form.canSubmit) return;
    await editMutation.mutateAsync({
      id: team.id,
      payload: { name: form.name, description: form.description },
    });
    onCancel(); // закрываем edit-mode
  };

  return (
    <TeamFormView
      mode="edit"
      hackathonName={hackathonName}
      name={form.name}
      description={form.description}
      onNameChange={form.setName}
      onDescriptionChange={form.setDescription}
      submitLabel="Сохранить"
      canSubmit={form.canSubmit}
      loading={editMutation.isPending}
      onSubmit={submit}
      onCancel={onCancel}
      extra={extra}
    />
  );
};
