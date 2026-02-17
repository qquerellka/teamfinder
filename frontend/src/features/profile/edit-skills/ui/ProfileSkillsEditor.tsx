import { useProfileSkillsEditor } from '../model/useProfileSkillsEditor';
import { ProfileSkillsEditorView } from './ProfileSkillsEditorView';

export const ProfileSkillsEditor = ({ disabled = false }) => {
  const { options, value, isLoading, error, onChange } = useProfileSkillsEditor();
  return (
    <ProfileSkillsEditorView
      options={options}
      value={value}
      isLoading={isLoading}
      error={error}
      onChange={onChange}
      disabled={disabled}
    />
  );
};
