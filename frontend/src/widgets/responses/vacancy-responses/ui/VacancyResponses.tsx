import { FC, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import { getHackathonTeamPath } from "@/shared/routing/paths";
import { SText } from "@/shared/ui";
import { useVacancyResponses, Response } from "@/entities/response";
import { ResponsesCardView } from "@/entities/response/ui/ResponseCardView";
import { ResponseRespondButtons } from "@/features/response/respond";

interface VacancyResponsesProps {
  vacancyId: number;
}

export const VacancyResponses: FC<VacancyResponsesProps> = ({ vacancyId }) => {
  const navigate = useNavigate();
  const { data } = useVacancyResponses(vacancyId);

  const responses: Response[] = data ?? [];

  const pending = useMemo(
    () => responses.filter((r) => r.status === "pending"),
    [responses]
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
        <ResponsesCardView
          key={i.id}
          actions={
            // <InviteRespondButtons
            //   inviteId={i.id}
            //   onAnswered={(status) => {
            //     if (status === "accepted") {
            //       navigate(getHackathonTeamPath(i.teamId));
            //     }
            //   }}
            // />
            <ResponseRespondButtons
              responseId={i.id}
              onAnswered={(status) => {
                if (status === "accepted") {
                  navigate(getHackathonTeamPath(10));
                }
              } } />}
          firstName={i.user.firstName}
          secondName={i.user.lastName}
          username={i.user.username}
          skills={[]} role={"DevOps"}        />
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
