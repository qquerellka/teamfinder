import { ChangeEvent, FC, useEffect, useRef } from 'react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';

      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <>
      <InputSection header="Обо мне">
        <StyledTextarea
          ref={textareaRef}
          status={error ? 'error' : 'default'}
          value={value}
          onChange={onChange}
          placeholder="Расскажите немного о себе..."
          disabled={disabled}
          style={{
            resize: 'none',
            overflowY: 'hidden',
          }}
        />
      </InputSection>
      {error && <ErrorText>{error}</ErrorText>}
    </>
  );
};

const StyledTextarea = styled(Textarea)`
  background-color: var(--tg-theme-secondary-bg-color);
  transition: height 0.2s ease;
`;
