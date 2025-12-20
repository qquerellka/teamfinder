import { Avatar, Link } from "@telegram-apps/telegram-ui";
import styled from "styled-components";
import { SText } from "@/shared/ui";
import { User } from "@/entities/user";
import { FC } from "react";
interface ProfileHeaderProps {
  user: User;
}
export const ProfileHeader: FC<ProfileHeaderProps> = ({ user }) => {
  const tgLink = `https://t.me/${user.username}`;

  return (
    <SProfileHeader>
      <Avatar size={96} src={user?.avatarUrl || undefined} />
      <SFullName>
        <SText $fs={24} $fw={600}>
          {user?.firstName}
        </SText>
        <SText $fs={24} $fw={600}>
          {user?.secondName}
        </SText>
        <UsernameLink
          href={tgLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <SText $fs={16} $fw={600}>
            @{user.username}
          </SText>
        </UsernameLink>
        {/* <SText >
          @{user?.username}
        </SText> */}
      </SFullName>
    </SProfileHeader>
  );
};

const SProfileHeader = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const SFullName = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

const UsernameLink = styled(Link)`
  text-decoration: none;
  color: var(--tg-theme-accent-text-color);
`;
