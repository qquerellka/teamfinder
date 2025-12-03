import React from "react";
import { Navigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { Button, List } from "@telegram-apps/telegram-ui";

import { HackathonCard } from "@/entities/hackathon/ui/HackathonCard";
import type { Hackathon } from "@/entities/hackathon/model/types";

import { paths } from "@/app/routing/paths";

import { normalizeUrl } from "@/shared/helpers/url";
import { Page } from "@/shared/ui/Page";
import { useHackathonQuery } from "@/entities/hackathon/api/hooks";

const HackathonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: hackathon, isLoading, isError } = useHackathonQuery(Number(id));


  if (isLoading) {
    return <Placeholder>Загружаем хакатон…</Placeholder>;
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


  return (
      <Page>
        <HackathonCard hackathon={hackathon} variant="full" />

        <ButtonsSection>
          <SButton mode="bezeled" onClick={openExternal} disabled={!url}>
            Подробнее на сайте
          </SButton>

        </ButtonsSection>
      </Page>
  );
};

export default HackathonPage;

const SButton = styled(Button)`
  width: 100%;
`;

const Placeholder = styled.div`
  padding: 1rem;
  text-align: center;
  font-size: 14px;
  opacity: 0.8;
`;

// const SSection = styled(Section)`
//   background: var(--tg-theme-section-bg-color, #fff);
//   padding: 0;
//   border-radius: 1rem;
//   width: 100%;

//   & > div {
//     padding: 0;
//   }
// `;

const ButtonsSection = styled(List)`
  margin-top: auto;          /* прижимаем к низу Page */
  display: flex;
  flex-direction: column;
`;
