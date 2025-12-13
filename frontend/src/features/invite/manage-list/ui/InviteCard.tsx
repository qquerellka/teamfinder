import { MegaInvite } from "@/entities/invite/model/types";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { useAnswerOnInvite } from "../hooks/useAnswerOnInvite";
import { getHackathonTeamPath } from "@/shared/routing/paths";
import { SIcon, SText, STitle } from "@/shared/ui";
import { IconButton } from "@telegram-apps/telegram-ui";
import styled from "styled-components";

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
      <FirstRow>
        <STitle $fs={16} $fw={700}>
          {"Приглашение"}
        </STitle>
        <Buttons>
          <IconButton disabled={isLoading} onClick={() => answer("rejected")}>
            <SIcon name={"cross"} color={"#F55A5A"} />
          </IconButton>

          <IconButton disabled={isLoading} onClick={() => answer("accepted")}>
            <SIcon name={"plus"} />
          </IconButton>
        </Buttons>
      </FirstRow>
      <SecondRow>
        <SText $fs={14} $fw={500}>
          {invite.teamName}
        </SText>

        <CountTeamMembers>
          <SIcon name={"profile"} />
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
  flex-direction: column;
    gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 1rem;
  background-color: var(--tg-theme-section-bg-color);
`;

const FirstRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const SecondRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
`;
