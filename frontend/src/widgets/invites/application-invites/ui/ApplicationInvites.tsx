import { FC, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import { useApplicationInvites } from "@/entities/invite";
import { InviteCardView } from "@/entities/invite/ui/InviteCardView";
import { InviteRespondButtons } from "@/features/invite/respond";
import { getHackathonTeamPath } from "@/shared/routing/paths";
import { SText } from "@/shared/ui";

interface ApplicationInvitesProps {
  appId: number;
}

export const ApplicationInvites: FC<ApplicationInvitesProps> = ({ appId }) => {
  const navigate = useNavigate();
  const { data } = useApplicationInvites(appId);

  const invites = data ?? [];
  const pending = useMemo(
    () => invites.filter((i) => i.status === "pending"),
    [invites],
  );

  if (pending.length === 0) {
    return (
      <Wrapper>
        <SText>Нет приглашений :(</SText>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <SText style={{ marginBottom: "1rem" }}>Приглашения в команду</SText>

      {pending.map((i) => (
        <InviteCardView
          key={i.id}
          teamName={i.teamName}
          teamMembersCount={i.teamMembersCount}
          teamMembersLimit={i.teamMembersLimit}
          actions={
            <InviteRespondButtons
              inviteId={i.id}
              onAnswered={(status) => {
                if (status === "accepted") {
                  navigate(getHackathonTeamPath(String(i.teamId)));
                }
              }}
            />
          }
        />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100%;
  gap: 0.75rem;
`;
