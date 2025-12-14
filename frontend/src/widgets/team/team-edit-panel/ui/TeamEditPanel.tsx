import { FC } from "react";
import styled from "styled-components";

import type { Hackathon } from "@/entities/hackathon";
import type { TeamWithMembers } from "@/entities/team";
import { useAuthUser } from "@/entities/user";

import { SIcon, SText, ConfirmModal } from "@/shared/ui";

import { EditTeamForm } from "@/features/team/edit";
import { useDeleteTeamAction } from "@/features/team/delete";
import { useLeaveTeamAction } from "@/features/team/leave";
import { TeamMembersSection } from "@/widgets/team/team-members";

interface Props {
  hackathon: Hackathon;
  team: TeamWithMembers;
  onClose: () => void;
  onExit: () => void;
}

export const TeamEditPanel: FC<Props> = ({
  hackathon,
  team,
  onClose,
  onExit,
}) => {
  const { data: user } = useAuthUser();
  const isCaptain = team.captainId === user.id;

  const del = useDeleteTeamAction({
    hackathonId: hackathon.id,
    teamId: team.id,
    onDone: onExit,
  });
  const { leave } = useLeaveTeamAction(team.id, { onDone: onExit });

  return (
    <>
      <Header>
        {isCaptain ? <SIcon onClick={del.open} name="delete" /> : <div />}
        <SText $fs={14} $fw={500}>
          Моя команда
        </SText>
        <SIcon onClick={leave} name="leaveTeam" />
      </Header>

      <EditTeamForm
        hackathon={hackathon}
        team={team}
        onCancel={onClose}
        extra={
          <TeamMembersSection
            teamId={team.id}
            members={team.members}
            membersLimit={hackathon.teamMembersLimit}
            canRemoveMembers={isCaptain}
          />
        }
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
    </>
  );
};

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
