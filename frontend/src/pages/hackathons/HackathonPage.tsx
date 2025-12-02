import React, { useState } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button, List, Modal } from "@telegram-apps/telegram-ui";

import { HackathonCard } from "@/entities/hackathon/ui/HackathonCard";
import { useHackathonQuery } from "@/entities/hackathon/api/hackathons";
import type { Hackathon } from "@/entities/hackathon/model/types";
import { useAuthUser } from "@/entities/user/api/hooks";
import { paths } from "@/app/routing/paths";

import { SText } from "@/shared/ui/SText";

const normalizeUrl = (raw?: string | null): string | undefined => {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  return trimmed;
};

const HackathonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: hackathon, isLoading, isError } = useHackathonQuery(Number(id));
  const { data: user, isLoading: isUserLoading } = useAuthUser();

  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return <Placeholder>Загружаем хакатон…</Placeholder>;
  }

  if (isError || !hackathon) {
    return <Navigate to={paths.error404} replace />;
  }

  const url = normalizeUrl((hackathon as Hackathon).registrationLink);

  const openExternal = () => {
    if (!url) return;

    const wa = (window as any).Telegram?.WebApp;
    if (wa?.openLink) {
      wa.openLink(url, { try_instant_view: true });
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };


  const handleGoToHackathon = () => {
    if (isUserLoading) return;

    const hasSkills =
      !!user && Array.isArray(user.skills) && user.skills.length > 0;

    if (!hasSkills) {
      setIsSkillsModalOpen(true);
      return;
    }
  };

  const handleGoToProfile = () => {
    setIsSkillsModalOpen(false);
    navigate(paths.profile);
  };

  return (
    <>
      <Page>
        <HackathonCard hackathon={hackathon} variant="full" />

        <SButton mode="bezeled" onClick={openExternal} disabled={!url}>
          Подробнее на сайте
        </SButton>

        <SButton onClick={handleGoToHackathon} disabled={isUserLoading}>
          Пойти на хакатон
        </SButton>
      </Page>

      <Modal
        open={isSkillsModalOpen}
        onOpenChange={setIsSkillsModalOpen}
        modal
        dismissible
      >
        <List
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
            gap: 0,
          }}
        >
          <SText>
            Чтобы участвовать в хакатоне, добавьте хотя бы один навык в свой
            профиль.
          </SText>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <Button
              size="m"
              mode="plain"
              onClick={() => setIsSkillsModalOpen(false)}
              style={{ flex: 1 }}
            >
              Потом
            </Button>
            <Button
              size="m"
              mode="bezeled"
              onClick={handleGoToProfile}
              style={{ flex: 1 }}
            >
              Заполнить профиль
            </Button>
          </div>
        </List>
      </Modal>
    </>
  );
};

export default HackathonPage;

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
`;

const SButton = styled(Button)`
  width: 100%;
`;

const Placeholder = styled.div`
  padding: 1rem;
  text-align: center;
  font-size: 14px;
  opacity: 0.8;
`;
