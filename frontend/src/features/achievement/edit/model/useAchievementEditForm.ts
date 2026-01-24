import { useEffect, useState } from 'react';
import type { Achievement, AchievementPlace } from '@/entities/achievement';
import { useEditAchievement } from '@/entities/achievement';
import type { AchievementFormValues } from '../../_shared/model/types';
import type { Role } from '@/shared/types/enums';

export function useAchievementEditForm(params: { achievement: Achievement; onDone?: () => void }) {
  const editMutation = useEditAchievement();

  const [values, setValues] = useState<AchievementFormValues>({
    hackathonId: params.achievement.hackathonId,
    role: '',
    place: '',
  });

  useEffect(() => {
    setValues({
      hackathonId: params.achievement.hackathonId,
      role: (params.achievement.role as Role) ?? '',
      place: (params.achievement.place as AchievementPlace) ?? '',
    });
  }, [params.achievement]);

  const setField = <K extends keyof AchievementFormValues>(
    field: K,
    value: AchievementFormValues[K],
  ) => setValues(p => ({ ...p, [field]: value }));

  const canSubmit = !!values.role && !!values.place;

  const handleSave = () => {
    if (!canSubmit) return;

    editMutation.mutate(
      {
        id: params.achievement.id,
        patch: {
          role: values.role as Role,
          place: values.place as AchievementPlace,
        },
      },
      { onSuccess: () => params.onDone?.() },
    );
  };

  return {
    values,
    setField,
    canSubmit,
    isSaving: editMutation.isPending,
    handleSave,
    hackathonName: params.achievement.hackathonName,
  };
}
