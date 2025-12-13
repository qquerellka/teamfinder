import { useProfileSkillsEditor } from "@/features/profile/edit-skills/hooks/useProfileSkillsEditor";
import { ProfileSkillsEditorView } from "@/features/profile/edit-skills/ui/ProfileSkillsEditorView";

export const ProfileSkillsEditor = () => {
  const { options, selectedOptions, isLoading, skillsError, handleChange } =
    useProfileSkillsEditor();

  return (
    <ProfileSkillsEditorView
      options={options}
      selectedOptions={selectedOptions}
      isLoading={isLoading}
      skillsError={skillsError}
      onChange={handleChange}
    />
  );
};
