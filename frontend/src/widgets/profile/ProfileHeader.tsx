import { Avatar, Link } from '@telegram-apps/telegram-ui';
import styled from 'styled-components';
import { FC } from 'react';

import { User } from '@/entities/user';
import { createSafeTelegramLink, isValidTelegramUsername } from '@/shared/helpers/telegramUsername';
import { SText } from '@/shared/ui';

interface ProfileHeaderProps {
  user: User;
}
export const ProfileHeader: FC<ProfileHeaderProps> = ({ user }) => {
  const tgLink = createSafeTelegramLink(user.username);
  const showLink = tgLink && isValidTelegramUsername(user.username);

  return (
    <ProfileHeaderContainer>
      <Avatar size={96} src={user.avatarUrl || undefined} />
      <ProfileFullName>
        <SText $fs={24} $fw={600}>
          {user.firstName}
        </SText>
        <SText $fs={24} $fw={600}>
          {user.secondName}
        </SText>
        {showLink && (
          <UsernameLink
            href={tgLink !== null ? tgLink : undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
          >
            <SText $fs={16} $fw={600}>
              @{user.username}
            </SText>
          </UsernameLink>
        )}
      </ProfileFullName>
    </ProfileHeaderContainer>
  );
};

const ProfileHeaderContainer = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const ProfileFullName = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

const UsernameLink = styled(Link)`
  text-decoration: none;
  color: var(--tg-theme-accent-text-color);
`;
