import type { FC } from 'react';
import { useState } from 'react';
import styled from 'styled-components';

// import { useNavigate } from 'react-router-dom';
import { TeamWithMembers } from '@/entities/team';
import { useTeamVacancies } from '@/entities/vacancy';
import { CreateVacancyForm } from '@/features/vacancy/create';
import { EditVacancyForm } from '@/features/vacancy/edit';
import { VacancyCard } from './VacancyCard';
import { VacancyResponses } from '@/widgets/responses/vacancy-responses';
import { Button } from '@telegram-apps/telegram-ui';

export const TeamVacancies: FC<{ team: TeamWithMembers }> = ({ team }) => {
  const { data: vacancies } = useTeamVacancies(team.id);
  const [isEditing, setIsEditing] = useState(false);
  // const navigate = useNavigate();
  const [addVacancy, setAddVacancy] = useState<boolean>(false);

  if (!vacancies || vacancies.length === 0 || addVacancy) {
    return <CreateVacancyForm teamId={team.id} onDone={() => setAddVacancy(false)} />;
  }

  if (isEditing) {
    return <EditVacancyForm vacancy={vacancies[0]} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <Wrapper>
      {team.members.length + vacancies.length < team.teamMembersLimit && (
        <Button mode="bezeled" onClick={() => setAddVacancy(true)}>
          {'Создать вакансию'}
        </Button>
      )}
      {vacancies.map(v => (
        <VacancyCard
          key={v.id}
          team={team}
          vacancy={v}
          onEditClick={() => setIsEditing(true)}
          onDeleted={() => console.log("vacancy deleted")}
        />
      ))}

      <VacancyResponses />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
