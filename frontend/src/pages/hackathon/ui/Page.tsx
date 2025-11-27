// src/pages/HackathonPage.tsx

import React from "react";
import { Navigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { Button } from "@telegram-apps/telegram-ui";

import { HackathonCard } from "@/entities/hackathon/ui/HackathonCard";
import { useHackathonQuery } from "@/entities/hackathon/api/hackathon-api";
import type { Hackathon } from "@/entities/hackathon/model/types";

// Хелпер для нормализации ссылок
const normalizeUrl = (raw?: string | null): string | undefined => {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const HackathonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Если id отсутствует в роуте — уходим назад к списку
  if (!id) {
    return <Navigate to="/hackathons" replace />;
  }

  const {
    data: hackathon,
    isLoading,
    isError,
  } = useHackathonQuery(id);

  // Состояние загрузки
  if (isLoading) {
    return (
      <Page>
        <Placeholder>Загружаем хакатон…</Placeholder>
      </Page>
    );
  }

  // Ошибка запроса
  if (isError) {
    return (
      <Page>
        <Placeholder>Не удалось загрузить данные хакатона. Попробуйте позже.</Placeholder>
        <NavigateBackButton to="/hackathons" />
      </Page>
    );
  }

  // Бэк вернул 404 / пусто
  if (!hackathon) {
    return <Navigate to="/hackathons" replace />;
  }

  const url = normalizeUrl(hackathon.registrationLink);

  const openExternal = () => {
    if (!url) return;

    const wa = (window as any).Telegram?.WebApp;
    if (wa?.openLink) {
      wa.openLink(url, { try_instant_view: true });
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Page>
      <HackathonCard hackathon={hackathon as Hackathon} variant="full" />
      <SButton mode="bezeled" onClick={openExternal} disabled={!url}>
        Подробнее на сайте
      </SButton>

      <SButton>
        Пойти на хакатон
      </SButton>
    </Page>
  );
};

export default HackathonPage;

// Вспомогательная кнопка "назад" (если понадобится)
const NavigateBackButton: React.FC<{ to: string }> = ({ to }) => {
  // Можно сделать отдельный компонент, сейчас просто заглушка
  return <a href={to}>← К списку хакатонов</a>;
};

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
