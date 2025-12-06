import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Achievement } from "@/entities/achievement/model/types";
import type { Hackathon } from "@/entities/hackathon/model/types";
import { AchievementPlace, Role } from "@/shared/types/enums";
import {
  useEditAchievement,
  useDeleteAchievement,
  useCreateAchievement,
} from "@/entities/achievement/api/hooks";

export type AchievementFormValues = {
  hackathonId: string;
  role: string;
  place: AchievementPlace | "";
};

interface UseAchievementFormParams {
  isNew: boolean;
  achievement: Achievement | null;
  hackathons: Hackathon[];
};

export function useAchievementForm({
  isNew,
  achievement,
  hackathons,
}: UseAchievementFormParams) {
  const navigate = useNavigate();

  const editAchievementMutation = useEditAchievement();
  const deleteAchievementMutation = useDeleteAchievement();
  const createAchievementMutation = useCreateAchievement();

  const [values, setValues] = useState<AchievementFormValues>({
    hackathonId: "",
    role: "",
    place: "",
  });

  useEffect(() => {
    if (!achievement || isNew) return;
    setValues({
      hackathonId: String(achievement.hackathonId),
      role: achievement.role ?? "",
      place: achievement.place ?? "",
    });
  }, [achievement, isNew]);

  const setField = <K extends keyof AchievementFormValues>(
    field: K,
    value: AchievementFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const canSubmit =
    !!values.role && !!values.place && (isNew ? !!values.hackathonId : true);

  const handleSave = () => {
    if (!canSubmit) return;

    if (isNew) {
      createAchievementMutation.mutate(
        {
          hackathonId: Number(values.hackathonId),
          role: values.role as Role,
          place: values.place as Achievement["place"],
        },
        { onSuccess: () => navigate(-1) },
      );
    } else if (achievement) {
      editAchievementMutation.mutate(
        {
          id: achievement.id,
          patch: {
            role: values.role as Role,
            place: values.place as Achievement["place"],
          },
        },
        { onSuccess: () => navigate(-1) },
      );
    }
  };

  const handleDelete = () => {
    if (!achievement) return;
    deleteAchievementMutation.mutate(achievement.id, {
      onSuccess: () => navigate(-1),
    });
  };

  return {
    isNew,
    achievement,
    hackathons,
    values,
    setField,
    canSubmit,
    isSaving:
      createAchievementMutation.isPending || editAchievementMutation.isPending,
    isDeleting: deleteAchievementMutation.isPending,
    handleSave,
    handleDelete,
  };
}
