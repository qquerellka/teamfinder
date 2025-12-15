import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button } from "@telegram-apps/telegram-ui";

import { HackathonCard, useHackathonQuery, Hackathon } from "@/entities/hackathon";
import { useAuthUser } from "@/entities/user";
import { useAuthUserApplicationsOnHackathon } from "@/entities/application";

import {
  getHackathonParticipationPath,
  getHackathonTeamPath,
  paths,
} from "@/shared/routing/paths";

import { normalizeUrl } from "@/shared/helpers/url";
import { Page } from "@/shared/ui";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import { useMyTeamOnHackathon } from "@/entities/team";

const HackathonPage: React.FC = () => {
  const { id } = useParams();

  const { data: hackathon } = useHackathonQuery(Number(id));
  const { data: user, isLoading: isUserLoading } = useAuthUser();
  const { data: application } = useAuthUserApplicationsOnHackathon(Number(id));
  const { data: team } = useMyTeamOnHackathon(Number(id));
  
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const navigate = useNavigate();

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

    if (id) navigate(getHackathonParticipationPath(Number(id)));
  };

  const handleGoToTeam = () => {
    if (isUserLoading) return;

    const hasSkills =
      !!user && Array.isArray(user.skills) && user.skills.length > 0;

    if (!hasSkills) {
      setIsSkillsModalOpen(true);
      return;
    }

    if (id) navigate(getHackathonTeamPath(Number(id)));
  };

  const handleGoToProfile = () => {
    setIsSkillsModalOpen(false);
    navigate(paths.user);
  };

  return (
    <>
      <SPage>
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
        ) : team ? (
          <ButtonsSection>
            <SButton mode="bezeled" onClick={openExternal} disabled={!url}>
              Подробнее на сайте
            </SButton>

            <SButton onClick={handleGoToTeam} disabled={isUserLoading}>
              Моя команда
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
      </SPage>

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

const ButtonsSection = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SPage = styled(Page)`
  gap: 0.5rem;
`