import { Multiselect, type MultiselectProps } from "@telegram-apps/telegram-ui";

import { ErrorText, InputSection } from "@/shared/ui";
import { FC } from "react";

type MultiSelectOption = MultiselectProps["options"][number];

interface ProfileSkillsEditorViewProps {
  options: MultiSelectOption[];
  selectedOptions: MultiSelectOption[];
  isLoading: boolean;
  skillsError: string | null;
  onChange: (selected: MultiSelectOption[]) => void;
}

export const ProfileSkillsEditorView: FC<ProfileSkillsEditorViewProps> = ({
  options,
  selectedOptions,
  isLoading,
  skillsError,
  onChange,
}) => {
  return (
    <InputSection header="Навыки">
      <Multiselect
        status={skillsError ? "error" : "default"}
        options={options}
        value={selectedOptions}
        onChange={onChange}
        selectedBehavior="hide"
        closeDropdownAfterSelect={false}
        creatable={false}
        placeholder={
          isLoading ? "Загружаем навыки..." : "Выберите до 10 навыков"
        }
      />
      {skillsError && <ErrorText>{skillsError}</ErrorText>}
    </InputSection>
  );
};
