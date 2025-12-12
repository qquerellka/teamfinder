import { useApplicationInvites } from "@/entities/invite/api/hooks";
import { MegaInvite } from "@/entities/invite/model/types";
import { SIcon, SText, STitle } from "@/shared/ui";
import { IconButton } from "@telegram-apps/telegram-ui";
import { FC } from "react";
import styled from "styled-components";
import profileIcon from "@/assets/icons/navbarIcons/ProfileIcon.svg?react"
import crossIcon from "@/assets/icons/crossIcon.svg?react"
import plusIcon from "@/assets/icons/plusIcon.svg?react"
interface ApplicationInvites {
  appId: number;
}

export const ApplicationInvites: FC<ApplicationInvites> = ({ appId }) => {
  const { data: invites } = useApplicationInvites(appId);
  return (
    <>
      <SText>Приглашения в команду</SText>
      {invites.map((i) => (
        <InviteCard invite={i}/>
      ))}
    </>
  );
};

interface InviteCardProps {
  invite: MegaInvite;
}
export const InviteCard: FC<InviteCardProps> = ({ invite }) => {

  return (
    <Wrapper>
      <FirstCol>
        <STitle>{"Приглашение"}</STitle>
        <SText>{invite.teamName}</SText>
      </FirstCol>
      <SecondRow>
        <Buttons>
          <IconButton>
            <SIcon icon={crossIcon}></SIcon>
          </IconButton>
          <IconButton>
            <SIcon icon={plusIcon}></SIcon>
          </IconButton>
        </Buttons>
        <CountTeamMembers>
          <SIcon icon={profileIcon} />
          <STitle $fs={16} $fw={700}>
            {invite.teamMembersCount} / {invite.teamMembersLimit}
          </STitle>
        </CountTeamMembers>
      </SecondRow>
    </Wrapper>
  );
};
const CountTeamMembers = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
`;
const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const FirstCol = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
`;

const SecondRow = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: end;
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
`;
