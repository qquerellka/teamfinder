
import { Button, Placeholder } from "@telegram-apps/telegram-ui";
import styled from "styled-components";

type AppErrorFallbackProps = {
  error: unknown;
};

export function AppErrorFallback({ error }: AppErrorFallbackProps) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : "Неизвестная ошибка";

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <Root>
      <Placeholder
        header="Что-то пошло не так"
        description="Попробуйте перезапустить приложение. Если ошибка повторяется, напишите нам."
      >
        <Button mode="bezeled" size="m" onClick={handleReload}>
          Обновить
        </Button>

        <ErrorDetails>
          <DetailsTitle>Техническая информация</DetailsTitle>
          <DetailsText>{message}</DetailsText>
        </ErrorDetails>
      </Placeholder>
    </Root>
  );
}

const Root = styled.div`
  min-height: 100vh;
  padding: 1rem;
  box-sizing: border-box;

  background: var(--tg-theme-bg-color, #0f172a);
  color: var(--tg-theme-text-color, #ffffff);

  display: flex;
  align-items: center;
  justify-content: center;
`;

const ErrorDetails = styled.div`
  margin-top: 0.75rem;
  max-width: 100%;
  text-align: left;
`;

const DetailsTitle = styled.div`
  font-size: 0.75rem;
  opacity: 0.7;
  margin-bottom: 0.25rem;
`;

const DetailsText = styled.pre`
  margin: 0;
  font-size: 0.625rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
  opacity: 0.7;
`;
