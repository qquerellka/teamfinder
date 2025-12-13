import type { FC } from "react";
import type { Achievement } from "@/entities/achievement";
import { AchievementFormView } from "../../_shared/ui/AchievementFormView";
import { useAchievementEditForm } from "../model/useAchievementEditForm";
import { useAchievementDelete } from "../../delete/model/useAchievementDelete";

export const AchievementEditForm: FC<{
  achievement: Achievement;
  onDone?: () => void;
}> = ({ achievement, onDone }) => {
  const form = useAchievementEditForm({ achievement, onDone });
  const del = useAchievementDelete({ onDone });

  return (
    <AchievementFormView
      mode="edit"
      hackathonName={form.hackathonName}
      values={form.values}
      onChange={form.setField}
      onSave={form.handleSave}
      canSubmit={form.canSubmit}
      isSaving={form.isSaving}
      onDelete={() => del.remove(achievement.id)}
      isDeleting={del.isDeleting}
    />
  );
};
