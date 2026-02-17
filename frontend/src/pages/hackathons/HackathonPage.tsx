import React, { useCallback, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@telegram-apps/telegram-ui';

import { HackathonCard, useHackathonQuery, Hackathon } from '@/entities/hackathon';
import { useAuthUser } from '@/entities/user';
import { useAuthUserApplicationsOnHackathon } from '@/entities/application';

import {
  getHackathonCreateTeamPath,
  getHackathonParticipationPath,
  getTeamPath,
  getUserAchievementPath,
  paths,
} from '@/shared/routing/paths';

import { normalizeUrl } from '@/shared/helpers/url';
import { Page } from '@/shared/ui';
import { ConfirmModal, ButtonsSection } from '@/shared/ui/';
import { useMyTeamOnHackathon } from '@/entities/team';
import { openLink } from '@tma.js/sdk-react';

const HackathonPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const hackathonId = Number(id);

  const { data: hackathon } = useHackathonQuery(hackathonId);
  const { data: user, isLoading: isUserLoading } = useAuthUser();
  const { data: application } = useAuthUserApplicationsOnHackathon(hackathonId);
  const { data: team } = useMyTeamOnHackathon(hackathonId);

  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);

  const url = normalizeUrl((hackathon as Hackathon).registrationLink);
  const participatedHack = user.achievements.filter(a => a.hackathonId === hackathonId);

  const handleGoToApplication = () => {
    if (isUserLoading) return;

    if (id) navigate(getHackathonParticipationPath(hackathonId));
  };

  const handleGoToCreateApplication = () => {
    if (isUserLoading) return;

    const hasSkills = !!user && Array.isArray(user.skills) && user.skills.length > 0;

    if (!hasSkills) {
      setIsSkillsModalOpen(true);
      return;
    }

    if (id) navigate(getHackathonParticipationPath(hackathonId));
  };

  const handleGoToTeam = () => {
    if (isUserLoading) return;

    if (id) navigate(getTeamPath(Number(team?.id)));
  };

  const handleGoToCreateTeam = () => {
    const hasSkills = !!user && Array.isArray(user.skills) && user.skills.length > 0;

    if (!hasSkills) {
      setIsSkillsModalOpen(true);
      return;
    }

    if (id) navigate(getHackathonCreateTeamPath(hackathonId));
  };

  const handleGoToProfile = () => {
    setIsSkillsModalOpen(false);
    navigate(paths.userRoot);
  };

  const handleGoToAddAch = () => {
    navigate(paths.userAchievementsRoot);
  };

  const achievement = useMemo(() => {
    if (!user || !Number.isFinite(hackathonId)) return undefined;
    return user.achievements?.find(a => a.hackathonId === hackathonId);
  }, [user, hackathonId]);

  const handleGoToAch = useCallback(() => {
    if (!achievement) return;
    navigate(getUserAchievementPath(achievement.id));
  }, [achievement, navigate]);
  return (
    <>
      <Page>
        <HackathonCard hackathon={hackathon} variant="full" />
        {participatedHack.length > 0 ? (
          <ButtonsSection>
            <Button mode="white" onClick={() => openLink(url!)} disabled={!url}>
              Подробнее
            </Button>

            <Button onClick={handleGoToAch} disabled={isUserLoading || !achievement}>
              К достижению
            </Button>
          </ButtonsSection>
        ) : hackathon.status === 'closed' ? (
          <ButtonsSection>
            <Button mode="white" onClick={() => openLink(url!)} disabled={!url}>
              Подробнее
            </Button>

            <Button onClick={handleGoToAddAch} disabled={isUserLoading}>
              Добавить в достижения
            </Button>
          </ButtonsSection>
        ) : application ? (
          <ButtonsSection>
            <Button mode="white" onClick={() => openLink(url!)} disabled={!url}>
              Подробнее
            </Button>

            <Button onClick={handleGoToApplication} disabled={isUserLoading}>
              Моя анкета
            </Button>
          </ButtonsSection>
        ) : team ? (
          <ButtonsSection>
            <Button mode="white" onClick={() => openLink(url!)} disabled={!url}>
              Подробнее
            </Button>

            <Button onClick={handleGoToTeam} disabled={isUserLoading}>
              Моя команда
            </Button>
          </ButtonsSection>
        ) : (
          <ButtonsSection>
            <Button mode="white" onClick={() => openLink(url!)} disabled={!url}>
              Подробнее
            </Button>

            <Button onClick={handleGoToCreateApplication} disabled={isUserLoading}>
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
