import type { Achievement } from "@/entities/achievement";
import type { Hackathon } from "@/entities/hackathon";
import { useAchievementForm } from "@/features/achievement/edit/hooks/useAchievementForm";
import { AchievementFormView } from "@/features/achievement/edit/ui/AchievementFormVeiw";
import { FC } from "react";

interface AchevementFormProps {
  isNew: boolean;
  achievement: Achievement | null;
  hackathons: Hackathon[];
};

export const AchievementForm:FC<AchevementFormProps> = ({isNew, achievement, hackathons}) => {
  const form = useAchievementForm({isNew, achievement, hackathons});

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
