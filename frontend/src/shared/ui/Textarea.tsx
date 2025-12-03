import React from "react";
import styled from "styled-components";

export type TextareaProps = {
  label?: string;
  helperText?: string;
  errorText?: string;
  maxLength?: number;
  className?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea: React.FC<TextareaProps> = ({
  label,
  helperText,
  errorText,
  maxLength,
  className,
  id,
  value,
  ...rest
}) => {
  const textareaId = id ?? React.useId();
  const hasError = Boolean(errorText);
  const ref = React.useRef<HTMLTextAreaElement | null>(null);

  // автогроу по value
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.height = "0px";            // сброс
    el.style.height = el.scrollHeight + "px"; // выставляем по контенту
  }, [value]);

  return (
    <Wrapper className={className}>
      {label && <Label $error={hasError} htmlFor={textareaId}>{label}</Label>}

      <Control $error={hasError}>
        <Field
          ref={ref}
          id={textareaId}
          value={value}
          maxLength={maxLength}
          {...rest}
        />
      </Control>

      <Footer>
        <Helper $error={hasError}>
          {hasError ? errorText : helperText}
        </Helper>
      </Footer>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Label = styled.label<{ $error: boolean }>`
  font-size: 20px;
  font-weight: bold;
  line-height: 24px;
  color: ${({ $error }) =>
    $error ? "var(--tg-theme-destructive-text-color)" : "var(--tg-hint-color)"};`;

const Control = styled.div<{ $error: boolean }>`
  border: none;
  background-color: var(--tg-secondary-bg-color);
`;

const Field = styled.textarea`
  width: 100%;
  resize: none;
  overflow: hidden;
  box-sizing: border-box;

  border: none;
  outline: none;
  background: transparent;
  color: var(--tg-text-color);
  font-family: inherit;
  font-size: 14px;
  line-height: 18px;

  &::placeholder {
    color: var(--tg-hint-color);
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 18px;
`;

const Helper = styled.div<{ $error: boolean }>`
  font-size: 11px;
  line-height: 14px;
  color: ${({ $error }) =>
    $error ? "var(--tg-theme-destructive-text-color)" : "var(--tg-hint-color)"};
`;
