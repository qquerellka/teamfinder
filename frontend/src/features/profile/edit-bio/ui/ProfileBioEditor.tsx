import { useProfileBioEditor } from '../model/useProfileBioEditor';
import { ProfileBioEditorView } from './ProfileBioEditorView';

export const ProfileBioEditor = ({ disabled = false }) => {
  const { bio, error, onChange } = useProfileBioEditor();
  return (
    <ProfileBioEditorView
      disabled={disabled}
      value={bio}
      error={error}
      onChange={onChange}
    />
  );
};
