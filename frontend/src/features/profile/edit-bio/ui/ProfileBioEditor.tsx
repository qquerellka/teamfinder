import { useProfileBioEditor } from "../model/useProfileBioEditor";
import { ProfileBioEditorView } from "./ProfileBioEditorView";

export const ProfileBioEditor = () => {
  const vm = useProfileBioEditor();
  return <ProfileBioEditorView value={vm.bio} error={vm.error} onChange={vm.onChange} />;
};
