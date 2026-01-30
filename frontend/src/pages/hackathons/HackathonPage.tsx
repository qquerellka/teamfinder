import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@telegram-apps/telegram-ui';

import { HackathonCard, useHackathonQuery, Hackathon } from '@/entities/hackathon';
import { useAuthUser } from '@/entities/user';
import { useAuthUserApplicationsOnHackathon } from '@/entities/application';

import {
  getHackathonCreateTeamPath,
  getHackathonParticipationPath,
  getTeamPath,
  paths,
} from '@/shared/routing/paths';

import { normalizeUrl } from '@/shared/helpers/url';
import { Page } from '@/shared/ui';
import { ConfirmModal, ButtonsSection } from '@/shared/ui/';
import { useMyTeamOnHackathon } from '@/entities/team';
import { openTelegramLink } from '@tma.js/sdk-react';

const HackathonPage: React.FC = () => {
  const { id } = useParams();

  const { data: hackathon } = useHackathonQuery(Number(id));
  const { data: user, isLoading: isUserLoading } = useAuthUser();
  const { data: application } = useAuthUserApplicationsOnHackathon(Number(id));
  const { data: team } = useMyTeamOnHackathon(Number(id));

  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const navigate = useNavigate();

  const url = normalizeUrl((hackathon as Hackathon).registrationLink);

  const handleGoToApplications = () => {
    if (isUserLoading) return;

    const hasSkills = !!user && Array.isArray(user.skills) && user.skills.length > 0;

    if (!hasSkills) {
      setIsSkillsModalOpen(true);
      return;
    }

    if (id) navigate(getHackathonParticipationPath(Number(id)));
  };

  const handleGoToTeam = () => {
    if (isUserLoading) return;

    const hasSkills = !!user && Array.isArray(user.skills) && user.skills.length > 0;

    if (!hasSkills) {
      setIsSkillsModalOpen(true);
      return;
    }

    if (id) navigate(getTeamPath(Number(team?.id)));
  };

  const handleGoToCreateTeam = () => {
    const hasSkills = !!user && Array.isArray(user.skills) && user.skills.length > 0;

    if (!hasSkills) {
      setIsSkillsModalOpen(true);
      return;
    }

    if (id) navigate(getHackathonCreateTeamPath(Number(id)));
  };

  const handleGoToProfile = () => {
    setIsSkillsModalOpen(false);
    navigate(paths.userRoot);
  };
  console.log(url);

  return (
    <>
      <Page>
        <HackathonCard hackathon={hackathon} variant="full" />
        {application ? (
          <ButtonsSection>
            <Button mode="white" onClick={() => openTelegramLink(url!)} disabled={!url}>
              Подробнее
            </Button>

            <Button onClick={handleGoToApplications} disabled={isUserLoading}>
              Моя анкета
            </Button>
          </ButtonsSection>
        ) : team ? (
          <ButtonsSection>
            <Button mode="white" onClick={() => openTelegramLink(url!)} disabled={!url}>
              Подробнее
            </Button>

            <Button onClick={handleGoToTeam} disabled={isUserLoading}>
              Моя команда
            </Button>
          </ButtonsSection>
        ) : (
          <ButtonsSection>
            <Button mode="white" onClick={() => openTelegramLink(url!)} disabled={!url}>
              Подробнее
            </Button>

            <Button onClick={handleGoToApplications} disabled={isUserLoading}>
              Найти команду
            </Button>
            <Button onClick={handleGoToCreateTeam} disabled={isUserLoading}>
              Создать команду
            </Button>
          </ButtonsSection>
        )}
      </Page>

      <ConfirmModal
        open={isSkillsModalOpen}
        title="Чтобы участвовать в хакатоне, добавьте хотя бы один навык в свой профиль."
        cancelText="Потом"
        confirmText="Заполнить"
        loading={false}
        onCancel={() => setIsSkillsModalOpen(false)}
        onConfirm={handleGoToProfile}
      />
    </>
  );
};

export default HackathonPage;