import type { FC } from 'react';

import type { Hackathon } from '@/entities/hackathon';
import { useCreateTeam } from '@/entities/team/api/hooks';
import { TeamFormView } from '../../_shared/ui/TeamFormView';
import { useCreateTeamForm } from '../model/useCreateTeamForm';
import { Role } from '@/shared/types/enums';
import styled from 'styled-components';
import { Subheadline } from '@telegram-apps/telegram-ui';

export const CreateTeamForm: FC<{
  hackathon: Hackathon;
  onDone?: (id: number) => void;
}> = ({ hackathon, onDone }) => {
  const createMutation = useCreateTeam(hackathon.id);
  const form = useCreateTeamForm();

  const submit = async () => {
    if (!form.canSubmit) return;
    const res = await createMutation.mutateAsync({
      role: form.role as Role,
      name: form.name,
      description: form.description,
    });
    onDone?.(res.id);
  };

  return (
    <>
      <Header>
        <Subheadline weight="2">Создание команды</Subheadline>
      </Header>
      <TeamFormView
        mode="create"
        hackathonName={hackathon.name}
        name={form.name}
        description={form.description}
        role={form.role}
        onRoleChange={form.setRole}
        onNameChange={form.setName}
        onDescriptionChange={form.setDescription}
        submitLabel="Создать"
        canSubmit={form.canSubmit}
        loading={createMutation.isPending}
        onSubmit={submit}
      />
    </>
  );
};

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  text-align: center;
`;
