import type { ChangeEvent, FC } from 'react';
import styled from 'styled-components';
import { Textarea } from '@telegram-apps/telegram-ui';
import { ErrorText, InputSection } from '@/shared/ui';

interface ProfileBioEditorViewProps {
  value: string;
  error: string | null;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

export const ProfileBioEditorView: FC<ProfileBioEditorViewProps> = ({
  value,
  error,
  onChange,
  disabled,
}) => {
  return (
    <>
      <InputSection header="Обо мне">
        <StyledTextarea
          status={error ? 'error' : 'default'}
          value={value}
          onChange={onChange}
          placeholder="Расскажите немного о себе..."
          disabled={disabled}
        />
      </InputSection>
      {error && <ErrorText>{error}</ErrorText>}
    </>
  );
};

const StyledTextarea = styled(Textarea)`
  background-color: var(--tg-theme-secondary-bg-color);
`;
