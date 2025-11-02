import { hackathons } from "@/shared/mocks/hackathons";
import type { Hackathon } from "@/shared/types/hackathon";
import { STitle } from "@/shared/ui/STitle";
import { HackathonCard } from "@/widgets/HackathonCard";
import { Button } from "@telegram-apps/telegram-ui";
import { Navigate, useParams } from "react-router-dom";
import styled from "styled-components";

export default function HackathonPage() {
  const { id } = useParams<{ id: string }>();
  const hackathon: Hackathon | undefined = hackathons.find(
    (h) => String(h.id) === id
  );

  if (!hackathon) return <Navigate to="/hackathons" replace />;

  // Нормализуем URL (на случай, если в моках без протокола)
  const raw = hackathon.registrationLink;
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
      <TitleBlock $fw={600} $fs={24}>
        {hackathon.name}
      </TitleBlock>
      <HackathonCard {...hackathon} />
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
const TitleBlock = styled(STitle)`
  align-self: center; /* центрирует элемент в поперечной оси flex */
`;

