import type { FC } from 'react';
import type { Hackathon } from '@/entities/hackathon';
import { AchievementFormView } from '../../_shared/ui/AchievementFormView';
import { useAchievementCreateForm } from '../model/useAchievementCreateForm';

export const AchievementCreateForm: FC<{
  hackathons: Hackathon[];
  onDone?: () => void;
}> = ({ hackathons, onDone }) => {
  const form = useAchievementCreateForm({ hackathons, onDone });

  return (
    <AchievementFormView
      mode="create"
      hackathons={form.hackathons}
      values={form.values}
      onChange={form.setField}
      onSave={form.handleSave}
      canSubmit={form.canSubmit}
      isSaving={form.isSaving}
    />
  );
};
