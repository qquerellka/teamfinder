import { Avatar } from "@telegram-apps/telegram-ui";
import styled from "styled-components";
import { SText } from "@/shared/ui";
import { useAuthUser } from "@/entities/user";

export const ProfileHeader = () => {
  const { data: user } = useAuthUser();

  return (
    <SProfileHeader>
      <Avatar size={96} src={user?.avatarUrl || undefined} />
      <SFullName>
        <SText $fs={24} $fw={600}>{user?.firstName}</SText>
        <SText $fs={24} $fw={600}>{user?.secondName}</SText>
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
