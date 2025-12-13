import { ProfileBioEditorView } from "@/features/profile/edit-bio/ui/ProfileBioEditorView";
import { useProfileBioEditor } from "@/features/profile/edit-bio/hooks/useProfileBioEditor";

export const ProfileBioEditor = () => {
  const { bio, bioError, handleChange } = useProfileBioEditor();

  return (
    <ProfileBioEditorView bio={bio} bioError={bioError} onChange={handleChange} />
  );
};