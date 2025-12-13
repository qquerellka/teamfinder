import type { Achievement } from "@/entities/achievement/model/types";
import type { Hackathon } from "@/entities/hackathon/model/types";
import { useAchievementForm } from "@/features/achievement/edit/hooks/useAchievementForm";
import { AchievementFormView } from "@/features/achievement/edit/ui/AchievementFormVeiw";

type Props = {
  isNew: boolean;
  achievement: Achievement | null;
  hackathons: Hackathon[];
};

export const AchievementForm = (props: Props) => {
  const form = useAchievementForm(props);

  return (
    <AchievementFormView
      isNew={form.isNew}
      achievementName={form.achievement?.hackathonName}
      hackathons={form.hackathons}
      values={form.values}
      onChange={form.setField}
      onSave={form.handleSave}
      onDelete={form.isNew ? undefined : form.handleDelete}
      canSubmit={form.canSubmit}
      isSaving={form.isSaving}
      isDeleting={form.isDeleting}
    />
  );
};
