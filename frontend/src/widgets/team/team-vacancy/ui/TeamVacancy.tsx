import type { FC } from "react";
import { useState } from "react";
import styled from "styled-components";

import { useNavigate } from "react-router-dom";
import { TeamWithMembers } from "@/entities/team";
import { useTeamVacancies } from "@/entities/vacancy";
import { CreateVacancyForm } from "@/features/vacancy/create";
import { EditVacancyForm } from "@/features/vacancy/edit";
import { VacancyCard } from "./VacancyCard";
import { VacancyResponses } from "@/widgets/responses/vacancy-responses";

export const TeamVacancy: FC<{ team: TeamWithMembers }> = ({ team }) => {
  const { data: vacancies } = useTeamVacancies(team.id);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  if (!vacancies || vacancies.length === 0) {
    return <CreateVacancyForm teamId={team.id} />;
  }

  if (isEditing) {
    return (
      <EditVacancyForm
        vacancy={vacancies[0]}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Wrapper>
      <VacancyCard
        team={team}
        vacancy={vacancies[0]}
        onEditClick={() => setIsEditing(true)}
        onDeleted={() => navigate(-1)}
      />
      <VacancyResponses vacancyId={vacancies[0].id} />
      {/* <ApplicationInvites appId={application.id} /> */}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
