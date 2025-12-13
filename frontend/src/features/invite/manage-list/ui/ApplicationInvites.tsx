import { FC } from "react";
import styled from "styled-components";

import { useApplicationInvites } from "@/entities/invite";
import { SText } from "@/shared/ui";
import { InviteCard } from "@/features/invite/manage-list/ui/InviteCard";

interface ApplicationInvites {
  appId: number;
}

export const ApplicationInvites: FC<ApplicationInvites> = ({ appId }) => {
  const { data: invites } = useApplicationInvites(appId);

  const filteredInvites = invites.filter((i) => i.status === 'pending');
  if (!filteredInvites || filteredInvites.length === 0) {
    return (
      <Wrapper>
        <SText>{"Нет приглашений :("}</SText>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <SText style={{ marginBottom: "1rem" }}>Приглашения в команду</SText>
      {filteredInvites.map((i) => (
        <InviteCard key={i.id} invite={i} />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100%;
`;
