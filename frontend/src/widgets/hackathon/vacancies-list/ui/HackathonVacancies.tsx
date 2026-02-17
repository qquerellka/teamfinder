import { FC, useMemo, useState } from 'react';
import styled from 'styled-components';

import { NoItems } from '@/shared/ui';
import { Hackathon } from '@/entities/hackathon';
import { useHackathonVacancies, Vacancy } from '@/entities/vacancy';
import { useMyResponses } from '@/entities/response';
import { useSendResponseAction } from '@/features/response/send';
import { useNavigate } from 'react-router-dom';
import { getTeamPath } from '@/shared/routing/paths';
import { VacancyCard } from '@/widgets/hackathon/vacancy-card';

interface HackathonVacanciesProps {
  hackathon: Hackathon;
}

export const HackathonVacancies: FC<HackathonVacanciesProps> = ({ hackathon }) => {
  const navigate = useNavigate();

  const { data: vacanciesData } = useHackathonVacancies(hackathon.id);
  const vacancies = vacanciesData?.filter(v => v.status === 'open') ?? [];

  const { data: responsesData, isFetching: isResponsesFetching } = useMyResponses();

  const responses = responsesData.filter(r => r.status === 'pending') ?? [];
  const repondedIds = useMemo(() => new Set(responses.map(i => i.vacancyId)), [responses]);

  const { send, isSending } = useSendResponseAction();

  const [responsingVacancyId, setResponsingVacancyId] = useState<number | null>(null);

  const handleReponse = async (vacancy: Vacancy) => {
    if (repondedIds.has(vacancy.id)) return;

    setResponsingVacancyId(vacancy.id);
    try {
      await send(vacancy.id);
    } finally {
      setResponsingVacancyId(null);
    }
  };

  if (vacancies.length === 0) {
    return <NoItems title={'На этот хакатон нет вакансий :('} />;
  }

  return (
    <VacanciesList>
      {vacancies.map(v => (
        <VacancyCard
          key={v.id}
          vacancy={v}
          responsed={repondedIds.has(v.id)}
          onResponse={() => handleReponse(v)}
          isResponsing={responsingVacancyId === v.id || isSending || isResponsesFetching}
          onNavigate={() => navigate(getTeamPath(v.teamId))}
        />
      ))}
    </VacanciesList>
  );
};

const VacanciesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
