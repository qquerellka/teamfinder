import { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import { IconButton } from '@telegram-apps/telegram-ui';

import { NoItems, RoleBadge, SIcon, SText } from '@/shared/ui';
import { Hackathon } from '@/entities/hackathon';
import { useHackathonVacancies, Vacancy } from '@/entities/vacancy';
import { useMyResponses } from '@/entities/response';
import { useSendResponseAction } from '@/features/response/send';
import { useNavigate } from 'react-router-dom';
import { getTeamPath } from '@/shared/routing/paths';

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

interface VacancyCardProps {
  vacancy: Vacancy;
  responsed: boolean;
  isResponsing: boolean;
  onResponse: () => void;
  onNavigate: () => void;
}

const VacancyCard: FC<VacancyCardProps> = ({
  isResponsing,
  onResponse,
  onNavigate,
  responsed,
  vacancy,
}) => {
  //   const skillsString = useMemo(() => {
  //     const skills = application.skills?.slice(0, 4) ?? [];
  //     return skills.map((s) => s.name).join(", ");
  //   }, [application.skills]);

  return (
    <Wrapper onClick={onNavigate}>
      <FirstRow>
        <SText $fs={16} $fw={600}>
          {vacancy.teamName}
        </SText>
        <RoleBadge role={vacancy.role} />
      </FirstRow>

      <SecondRow>
        {responsed ? (
          <SIcon name="sentInvite" size={36} />
        ) : (
          <IconButton
            style={{ borderRadius: 6, padding: 6 }}
            onClick={e => {
              e.stopPropagation();
              onResponse();
            }}
            disabled={isResponsing}
          >
            <SIcon name="plus" size={24} />
          </IconButton>
        )}

        <SText>{vacancy.description}</SText>
      </SecondRow>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 1rem;
  background-color: var(--tg-theme-section-bg-color);
`;

const FirstRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 0.5rem;
`;

const SecondRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: 0.5rem;
`;
