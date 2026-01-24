import { useProfileBioEditor } from '../model/useProfileBioEditor';
import { ProfileBioEditorView } from './ProfileBioEditorView';

export const ProfileBioEditor = ({ disabled = false }) => {
  const vm = useProfileBioEditor();
  return (
    <ProfileBioEditorView
      disabled={disabled}
      value={vm.bio}
      error={vm.error}
      onChange={vm.onChange}
    />
  );
};
