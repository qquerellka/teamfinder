import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';

import { getTeamPath } from '@/shared/routing/paths';
import { SText } from '@/shared/ui';
import { Response, useTeamResponses } from '@/entities/response';
import { ResponsesCardView } from '@/entities/response/ui/ResponseCardView';
import { ResponseRespondButtons } from '@/features/response/respond';

export const VacancyResponses: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useTeamResponses(Number(id));
  const responses: Response[] = data;

  // for (let i = 0; i < vacancies.length; i++) {
  //   const { data } = useVacancyResponses(vacancies[i].id);
  //   responses = responses.concat(data);
  // }

  const pending = useMemo(() => responses.filter(r => r.status === 'pending'), [responses]);

  if (pending.length === 0) {
    return (
      <Wrapper>
        <SText>Нет откликов :(</SText>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <SText style={{ marginBottom: '1rem' }}>Отклики на вакансии</SText>

      {pending.map(i => (
        <ResponsesCardView
          key={i.id}
          actions={
            <ResponseRespondButtons
              responseId={i.id}
              onAnswered={status => {
                if (status === 'accepted') {
                  navigate(getTeamPath(i.teamId));
                }
              }}
            />
          }
          firstName={i.user.firstName}
          secondName={i.user.lastName}
          username={i.user.username}
          skills={i.skills}
          role={i.role}
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
