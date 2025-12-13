import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuthUser } from "@/entities/user";
import { useHackathonsQuery } from "@/entities/hackathon";
import { AchievementCreateForm } from "@/features/achievement/create";
import { AchievementEditForm } from "@/features/achievement/edit";
import { Page, SText } from "@/shared/ui";

const AchievementPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isCreate = !id || id === "new";

  const { data: user } = useAuthUser();
  const { data: hackathonsResponse } = useHackathonsQuery();

  const hackathons = hackathonsResponse?.items ?? [];

  const achievement = useMemo(() => {
    if (isCreate) return null;

    const achievementId = Number(id);
    if (!Number.isFinite(achievementId)) return null;

    return user?.achievements.find((a) => a.id === achievementId) ?? null;
  }, [isCreate, id, user]);

  return (
    <Page>
      {isCreate ? (
        <AchievementCreateForm
          hackathons={hackathons}
          onDone={() => navigate(-1)}
        />
      ) : achievement ? (
        <AchievementEditForm
          achievement={achievement}
          onDone={() => navigate(-1)}
        />
      ) : (
        <section style={{ padding: "1.5rem" }}>
          <SText $fs={20} $fw={600}>
            Достижение не найдено
          </SText>
        </section>
      )}
    </Page>
  );
};

export default AchievementPage;
