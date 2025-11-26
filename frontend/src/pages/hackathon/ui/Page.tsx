import { hackathons } from "@/shared/mocks/hackathons";
import type { Hackathon } from "@/shared/types/hackathon";
import { HackathonCard } from "@/entities/hackathon/ui/HackathonCard";
import { Button } from "@telegram-apps/telegram-ui";
import { Navigate, useParams } from "react-router-dom";
import styled from "styled-components";

export default function HackathonPage() {
  const { id } = useParams<{ id: string }>();
  const h: Hackathon | undefined = hackathons.find(
    (h) => String(h.id) === id
  );

  if (!h) return <Navigate to="/hackathons" replace />;

  const raw = h.registrationLink;
  const url = raw
    ? raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `https://${raw}`
    : undefined;

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
      <HackathonCard hackathon={h} variant="full" />
      <SButton mode="bezeled" onClick={openExternal} disabled={!url}>
        Подробнее на сайте
      </SButton>
      <SButton>
        Пойти на хакатон
      </SButton>
    </Page>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
`;

const SButton = styled(Button)`
  width: 100%;
`;

