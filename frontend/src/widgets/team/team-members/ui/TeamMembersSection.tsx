import type { FC } from 'react';
import styled from 'styled-components';
import { Avatar } from '@telegram-apps/telegram-ui';

import type { TeamWithMembers } from '@/entities/team';
import { SIcon, SText } from '@/shared/ui';
import { useRemoveTeamMember } from '@/features/team-member/remove';
import { useNavigate } from 'react-router-dom';
import { getUserPath } from '@/shared/routing/paths';

type Member = TeamWithMembers['members'][number];

export const TeamMembersSection: FC<{
  teamId: number;
  members: Member[];
  membersLimit: number;
  canRemoveMembers: boolean;
}> = ({ teamId, members, membersLimit, canRemoveMembers }) => {
  const navigate = useNavigate();
  return (
    <Block>
      <HeaderRow>
        <SText $fs={16} $fw={600} style={{ color: 'var(--tg-theme-section-header-text-color)' }}>
          Участники
        </SText>

        <Count>
          <SIcon name="profile" />
          <SText $fs={16} $fw={700}>
            {members.length} / {membersLimit}
          </SText>
        </Count>
      </HeaderRow>

      <List>
        {members.map(m => (
          <TeamMemberRow
            key={m.user.id}
            teamId={teamId}
            member={m}
            canRemove={canRemoveMembers && !m.isCaptain}
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
  const { remove, isRemoving } = useRemoveTeamMember({
    teamId,
    userId: member.user.id,
  });

  return (
    <Row onClick={onNavigate}>
      <AvatarWrapper>
        <Avatar size={40} src={member.user.avatarUrl}>
          {member.user.firstName?.[0]}
        </Avatar>
      </AvatarWrapper>

      <Info>
        <Names>
          <SText $fs={16} $fw={600}>
            {fullName || 'Без имени'}
          </SText>
        </Names>

        <Meta>
          <SText $fs={14}>{member.role}</SText>
          {member.user.username && (
            <SText $fs={14} style={{ opacity: 0.8 }}>
              @{member.user.username}
            </SText>
          )}
        </Meta>
      </Info>

      {member.isCaptain ? (
        <SIcon name="captain" color="#F3BD28" />
      ) : canRemove ? (
        <SIcon
          name="cross"
          color="#F55A5A"
          onClick={e => {
            e.stopPropagation();
            if (!isRemoving) remove();
          }}
        />
      ) : (
        <Spacer />
      )}
    </Row>
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
  padding: 0 22px;
  margin-bottom: 0.5rem;
`;

const Count = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  gap: 4px;
  align-items: baseline;

  & > * {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const Meta = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 2px;
`;

const Spacer = styled.div`
  width: 24px;
`;
