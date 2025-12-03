import { Avatar } from "@telegram-apps/telegram-ui";
import styled from "styled-components";
import { STitle } from "@/shared/ui/STitle";
import { useAuthUser } from "@/entities/user/api/hooks";

export const ProfileHeader = () => {
  const { data: user } = useAuthUser();

  return (
    <SProfileHeader>
      <Avatar size={96} src={user?.avatarUrl || undefined} />
      <SFullName>
        <STitle $fs={24} $fw={600}>{user?.firstName}</STitle>
        <STitle $fs={24} $fw={600}>{user?.secondName}</STitle>
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
