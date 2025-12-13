import { useApplicationInvites } from "@/entities/invite/api/hooks";
import { SText, STitle } from "@/shared/ui";
import { FC } from "react";
import styled from "styled-components";


import { InviteCard } from "./InviteCard";
interface ApplicationInvites {
  appId: number;
}

export const ApplicationInvites: FC<ApplicationInvites> = ({ appId }) => {
  const { data: invites } = useApplicationInvites(appId);

  if (!invites || invites.length === 0) {
    return <STitle>{"Нет приглашений :("}</STitle>; // или плейсхолдер
  }

  return (
    <Wrapper>
      <SText>Приглашения в команду</SText>
      {invites.map((i) => (
        <InviteCard key={i.id} invite={i} />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
`