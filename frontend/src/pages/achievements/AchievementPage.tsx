import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { useAuthUser } from "@/entities/user/api/hooks";
import { useHackathonsQuery } from "@/entities/hackathon/api/hooks";
import { AchievementForm } from "@/features/achievement/edit/ui/AchievementForm";

const AchievementPage = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";

  const { data: user } = useAuthUser();
  const { data: hackathonsResponse } = useHackathonsQuery();

  const achievement = useMemo(
    () =>
      isNew
        ? null
        : user?.achievements.find((a) => a.id === Number(id)) ?? null,
    [user, id, isNew],
  );

  const hackathons = hackathonsResponse?.items ?? [];

  return (
    <AchievementForm
      isNew={isNew}
      achievement={achievement}
      hackathons={hackathons}
    />
  );
};

export default AchievementPage;
