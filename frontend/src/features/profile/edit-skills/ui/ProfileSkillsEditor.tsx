import { useProfileSkillsEditor } from "../hooks/useProfileSkillsEditor";
import { ProfileSkillsEditorView } from "./ProfileSkillsEditorView";

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
