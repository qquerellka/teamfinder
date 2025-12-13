import { useState } from "react";
import { useCreateAchievement } from "@/entities/achievement";
import type { Hackathon } from "@/entities/hackathon";
import type { AchievementFormValues } from "../../_shared/model/types";
import type { Role } from "@/shared/types/enums";
import type { AchievementPlace } from "@/entities/achievement";

export function useAchievementCreateForm(params: {
  hackathons: Hackathon[];
  onDone?: () => void;
}) {
  const createMutation = useCreateAchievement();

  const [values, setValues] = useState<AchievementFormValues>({
    hackathonId: null,
    role: "",
    place: "",
  });

  const setField = <K extends keyof AchievementFormValues>(
    field: K,
    value: AchievementFormValues[K],
  ) => setValues((p) => ({ ...p, [field]: value }));

  const canSubmit = !!values.hackathonId && !!values.role && !!values.place;

  const handleSave = () => {
    if (!canSubmit) return;

    createMutation.mutate(
      {
        hackathonId: values.hackathonId!,
        role: values.role as Role,
        place: values.place as AchievementPlace,
      },
      { onSuccess: () => params.onDone?.() },
    );
  };

  return {
    values,
    setField,
    canSubmit,
    isSaving: createMutation.isPending,
    handleSave,
    hackathons: params.hackathons,
  };
}
