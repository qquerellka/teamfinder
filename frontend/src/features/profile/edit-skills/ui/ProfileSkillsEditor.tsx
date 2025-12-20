import { useProfileSkillsEditor } from "../model/useProfileSkillsEditor";
import { ProfileSkillsEditorView } from "./ProfileSkillsEditorView";

export const ProfileSkillsEditor = () => {
  const vm = useProfileSkillsEditor();
  return (
    <ProfileSkillsEditorView
      options={vm.options}
      value={vm.value}
      isLoading={vm.isLoading}
      error={vm.error}
      onChange={vm.onChange}
    />
  );
};
