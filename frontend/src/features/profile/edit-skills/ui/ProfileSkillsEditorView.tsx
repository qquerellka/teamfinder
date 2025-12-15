import type { FC } from "react";
import { Multiselect, type MultiselectProps } from "@telegram-apps/telegram-ui";
import { ErrorText, InputSection } from "@/shared/ui";

type Option = MultiselectProps["options"][number];

interface ProfileSkillsEditorViewProps {
  options: Option[];
  value: Option[];
  isLoading: boolean;
  error: string | null;
  onChange: (selected: Option[]) => void;
  disabled?: boolean;
}

export const ProfileSkillsEditorView: FC<ProfileSkillsEditorViewProps> = ({
  options,
  value,
  isLoading,
  error,
  onChange,
  disabled,
}) => {
  return (
    <InputSection header="Навыки">
      <Multiselect
        status={error ? "error" : "default"}
        options={options}
        value={value}
        onChange={onChange}
        selectedBehavior="hide"
        closeDropdownAfterSelect={false}
        creatable={false}
        placeholder={
          isLoading ? "Загружаем навыки..." : "Выберите до 10 навыков"
        }
        disabled={disabled}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </InputSection>
  );
};
