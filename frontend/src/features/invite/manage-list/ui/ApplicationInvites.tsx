import { useApplicationInvites } from "@/entities/invite/api/hooks";
import { SText, STitle } from "@/shared/ui";
import { FC } from "react";
import styled from "styled-components";

import { InviteCard } from "./InviteCard";
// import { InviteStatus } from "@/entities/invite/model/types";
// import { Role } from "@/shared/types/enums";
interface ApplicationInvites {
  appId: number;
}

export const ApplicationInvites: FC<ApplicationInvites> = ({ appId }) => {
  const { data: invites } = useApplicationInvites(appId);
  // const mockInvites = [{
  //       id: 1,
  //       status: 'accepted' as InviteStatus,
  //       role: "DevOps" as Role,
  //       teamId: 1,
  //       applicationId: 1,
  //       teamName: "MISIS X MISIS",
  //       hackathonId: 1,
  //       teamMembersCount: 1,
  //       teamMembersLimit: 4,
  // }]
  if (!invites || invites.length === 0) {
    return (
      <Wrapper>
        <STitle>{"Нет приглашений :("}</STitle>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <SText style={{ marginBottom: "1rem" }}>Приглашения в команду</SText>
      {invites.map((i) => (
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
