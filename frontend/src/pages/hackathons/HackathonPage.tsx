import React, { useState } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button, List } from "@telegram-apps/telegram-ui";

import { HackathonCard } from "@/entities/hackathon/ui/HackathonCard";
import type { Hackathon } from "@/entities/hackathon/model/types";
import { useAuthUser } from "@/entities/user/api/hooks";
import { useHackathonQuery } from "@/entities/hackathon/api/hooks";
import { useAuthUserApplicationsOnHackathon } from "@/entities/application/api/hooks";

import {
  getHackathonParticipationPath,
  getHackathonTeamPath,
  paths,
} from "@/app/routing/paths";

import { normalizeUrl } from "@/shared/helpers/url";
import { LoaderPage, Page } from "@/shared/ui";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";

const HackathonPage: React.FC = () => {
  const { id } = useParams();

  const { data: hackathon, isLoading, isError } = useHackathonQuery(Number(id));
  const { data: user, isLoading: isUserLoading } = useAuthUser();
  const { data: application, isLoading: isAppllicationLoading } =
    useAuthUserApplicationsOnHackathon(Number(id));

  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const navigate = useNavigate();

  if (isLoading || isAppllicationLoading || isUserLoading) {
    return <LoaderPage />;
  }

  if (isError || !hackathon) {
    return <Navigate to={paths.error404} replace />;
  }

  const url = normalizeUrl((hackathon as Hackathon).registrationLink);

  const openExternal = () => {
    if (!url) return;

    const wa = window.Telegram?.WebApp;
    if (wa?.openLink) {
      wa.openLink(url, { try_instant_view: true });
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleGoToApplications = () => {
    if (isUserLoading) return;

    const hasSkills =
      !!user && Array.isArray(user.skills) && user.skills.length > 0;

    if (!hasSkills) {
      setIsSkillsModalOpen(true);
      return;
    }

    if (id) navigate(getHackathonParticipationPath(id));
  };

  const handleGoToTeam = () => {
    if (isUserLoading) return;

    const hasSkills =
      !!user && Array.isArray(user.skills) && user.skills.length > 0;

    if (!hasSkills) {
      setIsSkillsModalOpen(true);
      return;
    }

    if (id) navigate(getHackathonTeamPath(id));
  };

  const handleGoToProfile = () => {
    setIsSkillsModalOpen(false);
    navigate(paths.profile);
  };

  return (
    <>
      <Page>
        <HackathonCard hackathon={hackathon} variant="full" />
        {application ? (
          <ButtonsSection>
            <SButton mode="bezeled" onClick={openExternal} disabled={!url}>
              Подробнее на сайте
            </SButton>

            <SButton onClick={handleGoToApplications} disabled={isUserLoading}>
              Моя анкета
            </SButton>
          </ButtonsSection>
        ) : (
          <ButtonsSection>
            <SButton mode="bezeled" onClick={openExternal} disabled={!url}>
              Подробнее на сайте
            </SButton>

            <SButton onClick={handleGoToApplications} disabled={isUserLoading}>
              Найти команду
            </SButton>
            <SButton onClick={handleGoToTeam} disabled={isUserLoading}>
              Создать команду
            </SButton>
          </ButtonsSection>
        )}
      </Page>

      <ConfirmModal
        open={isSkillsModalOpen}
        title="Чтобы участвовать в хакатоне, добавьте хотя бы один навык в свой профиль."
        cancelText="Потом"
        confirmText="Заполнить профиль"
        loading={false}
        onCancel={() => setIsSkillsModalOpen(false)}
        onConfirm={handleGoToProfile}
      />
    </>
  );
};

export default HackathonPage;

const SButton = styled(Button)`
  width: 100%;
`;

const ButtonsSection = styled(List)`
  margin-top: auto;
  display: flex;
  flex-direction: column;
`;
