import { FC } from 'react';
import styled from 'styled-components';
import { Button, Input, Textarea } from '@telegram-apps/telegram-ui';
import { useNavigate } from 'react-router-dom';

import type { TeamWithMembers } from '@/entities/team';
import { useAuthUser } from '@/entities/user';

import { InputSection, SIcon, SText } from '@/shared/ui';
import { getFindTeamMembersPath } from '@/shared/routing/paths';

import { useCopyTeamInviteLink } from '@/features/team/copy-invite-link';
import { useLeaveTeamAction } from '@/features/team/leave';
import { TeamMembersSection } from '@/widgets/team/team-members';

interface TeamCardProps {
  team: TeamWithMembers;
  onEditClick?: () => void;
  onExit?: () => void;
}

export const TeamCard: FC<TeamCardProps> = ({ team, onEditClick, onExit }) => {
  const navigate = useNavigate();
  const { data: user } = useAuthUser();

  const isCaptain = team.captainId === user.id;
  const isMember = team.members.filter(m => m.user.id === user.id).length === 1;

  const { copy, isCopying, copied } = useCopyTeamInviteLink(team.id);
  const { leave } = useLeaveTeamAction(team.id, { onDone: onExit });

  return (
    <Root>
      <Header>
        <div />
        <SText $fs={14} $fw={500}>
          {isMember ? 'Моя команда' : 'Команда'}
        </SText>

        {isCaptain ? (
          <SIcon onClick={onEditClick} name="edit" />
        ) : isMember ? (
          <SIcon onClick={leave} name="leaveTeam"/>
        ) : (
          <div />
        )}
      </Header>

      <InputSection header="Хакатон">
        <Input value={team.hackathonName} disabled />
      </InputSection>

      <InputSection header="Название">
        <Input value={team.name} disabled />
      </InputSection>

      <InputSection header="Описание">
        <Textarea value={team.description} disabled />
      </InputSection>

      <TeamMembersSection
        teamId={team.id}
        members={team.members}
        membersLimit={team.teamMembersLimit}
        canRemoveMembers={isCaptain}
      />
      {isMember && (
        <Buttons>
          {isCaptain && (
            <SButton mode="bezeled" onClick={copy} stretched disabled={isCopying}>
              {copied ? 'Ссылка скопирована' : 'Пригласить по ссылке'}
            </SButton>
          )}

          {isCaptain && (
            <SButton
              onClick={() => navigate(getFindTeamMembersPath(String(team.id)))}
              stretched
              disabled={isCopying}
            >
              Найти участников
            </SButton>
          )}

          {/* {!isCaptain && (
            <SButton mode="bezeled" onClick={leave} stretched disabled={isLeaving}>
              Покинуть команду
            </SButton>
          )} */}
        </Buttons>
      )}
    </Root>
  );
};

const Root = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1rem;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Buttons = styled.div`
  margin-top: auto;
  padding-bottom: env(safe-area-inset-bottom, 0);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SButton = styled(Button)`
  width: 100%;
`;
