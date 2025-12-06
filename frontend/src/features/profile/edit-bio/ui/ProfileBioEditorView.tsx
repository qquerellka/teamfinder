import { ChangeEvent } from "react";
import styled from "styled-components";
import { Textarea } from "@telegram-apps/telegram-ui";
import { ErrorText, InputSection } from "@/shared/ui";

type Props = {
  bio: string;
  bioError: string | null;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

export function ProfileBioEditorView({ bio, bioError, onChange }: Props) {
  return (
    <InputSection header="Обо мне">
      <StyledTextarea
        status={bioError ? "error" : "default"}
        value={bio}
        onChange={onChange}
        placeholder="Расскажите немного о себе..."
      />
      {bioError && <ErrorText>{bioError}</ErrorText>}
    </InputSection>
  );
}

const StyledTextarea = styled(Textarea)`
  background-color: var(--tg-theme-secondary-bg-color);
`;
