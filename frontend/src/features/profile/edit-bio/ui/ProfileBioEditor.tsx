import { ProfileBioEditorView } from "./ProfileBioEditorView";
import { useProfileBioEditor } from "../hooks/useProfileBioEditor";

export const ProfileBioEditor = () => {
  const { bio, bioError, handleChange } = useProfileBioEditor();

  return (
    <ProfileBioEditorView bio={bio} bioError={bioError} onChange={handleChange} />
  );
};