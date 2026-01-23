import { FC } from 'react';
import styled from 'styled-components';

import type { TeamWithMembers } from '@/entities/team';
import { useAuthUser } from '@/entities/user';

import { SIcon, SText, ConfirmModal } from '@/shared/ui';

import { EditTeamForm } from '@/features/team/edit';
import { useDeleteTeamAction } from '@/features/team/delete';
import { useLeaveTeamAction } from '@/features/team/leave';
import { TeamMembersSection } from '@/widgets/team/team-members';

interface Props {
  team: TeamWithMembers;
  onClose: () => void;
  onExit: () => void;
}

export const TeamEditPanel: FC<Props> = ({ team, onClose, onExit }) => {
  const { data: user } = useAuthUser();
  const isCaptain = team.captainId === user.id;

  const del = useDeleteTeamAction({
    hackathonId: team.hackathonId,
    teamId: team.id,
    onDone: onExit,
  });
  const { leave } = useLeaveTeamAction(team.id, { onDone: onExit });

  return (
    <Root>
      <Header>
        {isCaptain ? <SIcon onClick={del.open} name="delete" /> : <div />}
        <SText $fs={14} $fw={500}>
          Моя команда
        </SText>
        <SIcon onClick={leave} name="leaveTeam" />
      </Header>

      <EditTeamForm
        team={team}
        onCancel={onClose}
        extra={
          <TeamMembersSection
            teamId={team.id}
            members={team.members}
            membersLimit={team.teamMembersLimit}
            canRemoveMembers={isCaptain}
          />
        }
        hackathonName={team.hackathonName}
      />

      <ConfirmModal
        open={del.isOpen}
        title="Удалить команду?"
        confirmText="Удалить"
        cancelText="Отмена"
        loading={del.isDeleting}
        onConfirm={del.confirm}
        onCancel={del.cancel}
      />
    </Root>
  );
};
const Root = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1.5rem;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
