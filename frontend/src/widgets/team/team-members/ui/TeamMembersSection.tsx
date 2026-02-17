import type { FC } from 'react';
import styled from 'styled-components';
import { Avatar, Subheadline, Text } from '@telegram-apps/telegram-ui';

import type { TeamWithMembers } from '@/entities/team';
import { ConfirmModal, RoleBadge, SIcon, TeamLoad } from '@/shared/ui';
import { useRemoveTeamMember } from '@/features/team-member/remove';
import { useNavigate } from 'react-router-dom';
import { getUserPath } from '@/shared/routing/paths';

type Member = TeamWithMembers['members'][number];

export const TeamMembersSection: FC<{
  teamId: number;
  members: Member[];
  membersLimit: number;
  canRemoveMembers: boolean;
  isEditing?: boolean;
}> = ({ teamId, members, membersLimit, canRemoveMembers, isEditing = false }) => {
  const navigate = useNavigate();
  return (
    <Block>
      <HeaderRow>
        <Text weight="2" style={{ color: 'var(--tg-theme-section-header-text-color)' }}>
          Участники
        </Text>
        <TeamLoad teamMembersCount={members.length} teamMembersLimit={membersLimit} />
      </HeaderRow>

      <List>
        {members.map(m => (
          <TeamMemberRow
            key={m.user.id}
            teamId={teamId}
            member={m}
            canRemove={isEditing && canRemoveMembers && !m.isCaptain}
            onNavigate={() => navigate(getUserPath(m.user.id))}
          />
        ))}
      </List>
    </Block>
  );
};

const TeamMemberRow: FC<{
  teamId: number;
  member: Member;
  canRemove: boolean;
  onNavigate: () => void;
}> = ({ teamId, member, canRemove, onNavigate }) => {
  const fullName = `${member.user.firstName ?? ''} ${member.user.lastName ?? ''}`.trim();
  const {
    remove,
    isRemoving,
    isOpen: isDeleteModalOpen,
    open: openDeleteModal,
    cancel,
  } = useRemoveTeamMember({
    teamId,
    userId: member.user.id,
  });

  return (
    <>
      <Row onClick={onNavigate}>
        <AvatarWrapper>
          <Avatar size={40} src={member.user.avatarUrl}>
            {member.user.firstName?.[0]}
          </Avatar>
        </AvatarWrapper>

        <Info>
          <Names>
            <Text weight="2">{fullName}</Text>
            <RoleBadge size="s" role={member.role} />
          </Names>

          <Meta>
            {member.user.username && (
              <Subheadline level="2" style={{ opacity: 0.8 }}>
                @{member.user.username}
              </Subheadline>
            )}
          </Meta>
        </Info>

        {member.isCaptain ? (
          <SIcon name="captain" color="#F3BD28" />
        ) : canRemove ? (
          <SIcon
            name="cross"
            size={16}
            color="#F55A5A"
            onClick={e => {
              e.stopPropagation();
              openDeleteModal();
            }}
          />
        ) : (
          <Spacer />
        )}
      </Row>
      <ConfirmModal
        open={isDeleteModalOpen}
        title="Удалить участника?"
        confirmText="Удалить"
        cancelText="Отмена"
        loading={isRemoving}
        onConfirm={remove}
        onCancel={cancel}
      />
    </>
  );
};

const Block = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 0.5rem;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  padding: 8px 22px;
  box-sizing: border-box;

  gap: 12px;
  border-radius: 1rem;
  background-color: var(--tg-theme-section-bg-color);
`;

const AvatarWrapper = styled.div`
  flex-shrink: 0;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const Names = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;

  & > * {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
`;

const Spacer = styled.div`
  width: 24px;
`;
