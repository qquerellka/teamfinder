import { Avatar, Link, Text, Title } from '@telegram-apps/telegram-ui';
import styled from 'styled-components';
import { FC } from 'react';

import { User } from '@/entities/user';
import { createSafeTelegramLink, isValidTelegramUsername } from '@/shared/helpers/telegramUsername';

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
        <Title plain={true} weight="2">
          {user.firstName}
        </Title>
        <Title plain={true} weight="2">
          {user.secondName}
        </Title>
        {showLink && (
          <UsernameLink
            href={tgLink !== null ? tgLink : undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
          >
            <Text weight="2">@{user.username}</Text>
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
`;

const UsernameLink = styled(Link)`
  text-decoration: none;
  color: var(--tg-theme-accent-text-color);
`;
