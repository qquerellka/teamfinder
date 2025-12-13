import { useApplicationInvites } from "@/entities/invite/api/hooks";
import { MegaInvite } from "@/entities/invite/model/types";
import { SIcon, SText, STitle } from "@/shared/ui";
import { IconButton } from "@telegram-apps/telegram-ui";
import { FC } from "react";
import styled from "styled-components";
import profileIcon from "@/assets/icons/navbarIcons/ProfileIcon.svg?react";
import crossIcon from "@/assets/icons/crossIcon.svg?react";
import plusIcon from "@/assets/icons/plusIcon.svg?react";
import { useAnswerOnInvite } from "../hooks/useAnswerOnInvite";
import { getHackathonTeamPath } from "@/app/routing/paths";
import { useNavigate } from "react-router-dom";
interface ApplicationInvites {
  appId: number;
}

export const ApplicationInvites: FC<ApplicationInvites> = ({ appId }) => {
  const { data: invites } = useApplicationInvites(appId);

  if (!invites || invites.length === 0) {
    return <STitle>{"Нет приглашений :("}</STitle>; // или плейсхолдер
  }

  return (
    <>
      <SText>Приглашения в команду</SText>
      {invites.map((i) => (
        <InviteCard key={i.id} invite={i} />
      ))}
    </>
  );
};

interface InviteCardProps {
  invite: MegaInvite;
}
export const InviteCard: FC<InviteCardProps> = ({ invite }) => {
  const navigate = useNavigate();
  const { answer, isLoading } = useAnswerOnInvite({
    inviteId: invite.id,
    // опционально: закрыть модалку / показать тост
    onAnswered: () => {
      navigate(getHackathonTeamPath(String(invite.teamId)));
      // console.log("answered", status);
    },
  });
  return (
    <Wrapper>
      <FirstCol>
        <STitle $fs={16} $fw={700}>
          {"Приглашение"}
        </STitle>
        <SText $fs={14} $fw={500}>
          {invite.teamName}
        </SText>
      </FirstCol>
      <SecondRow>
        <Buttons>
          <IconButton disabled={isLoading} onClick={() => answer("rejected")}>
            <SIcon icon={crossIcon} color={"#F55A5A"} />
          </IconButton>

          <IconButton disabled={isLoading} onClick={() => answer("accepted")}>
            <SIcon icon={plusIcon} />
          </IconButton>
        </Buttons>
        <CountTeamMembers>
          <SIcon icon={profileIcon} />
          <STitle $fs={14} $fw={500}>
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
  padding: 0.75rem;
  border-radius: 1rem;
  background-color: var(--tg-theme-section-bg-color);
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
