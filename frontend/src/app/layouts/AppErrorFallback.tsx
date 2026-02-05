import { SText } from '@/shared/ui';
import { FC } from 'react';
import { Button, Placeholder } from '@telegram-apps/telegram-ui';
import styled from 'styled-components';
import { NotFoundPage } from '@/pages/not-found/NotFound';
import { AUTH_QUERY_KEY } from '@/features/auth';
import { useQueryClient } from '@tanstack/react-query';
import { authQueryFn } from '@/features/auth/api/login';

interface AppErrorFallbackProps {
  error: unknown;
  resetErrorBoundary?: () => void; // сбросить состояние ошибки и перерендерить компонент
}

export const AppErrorFallback: FC<AppErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const isNotFound =
    error instanceof Error &&
    (error.message.includes('404') ||
      error.message.includes('not found') ||
      error.message.includes('Not Found'));

  if (isNotFound) {
    return <NotFoundPage />;
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Неизвестная ошибка';

  const handleReload = () => {
    window.location.reload();
  };

  const queryClient = useQueryClient();

  const handleRetry = async () => {
    resetErrorBoundary?.();

    if (error instanceof Error && error.message.includes('401')) {
      try {
        await queryClient.fetchQuery({
          queryKey: AUTH_QUERY_KEY,
          queryFn: authQueryFn,
        });
      } catch (error) {
        console.error('Failed to re-authenticate:', error);
        window.location.reload();
      }
    }
  };

  return (
    <Root>
      <Placeholder
        header="Что-то пошло не так"
        description="Попробуйте повторить. Если ошибка повторяется, перезапустите приложение."
      >
        <Buttons>
          <Button mode="white" size="m" onClick={handleRetry} disabled={!resetErrorBoundary}>
            Повторить
          </Button>

          <Button mode="plain" size="m" onClick={handleReload}>
            Обновить
          </Button>
        </Buttons>

        <ErrorDetails>
          <DetailsTitle>Техническая информация</DetailsTitle>
          <DetailsText>{message}</DetailsText>
        </ErrorDetails>
      </Placeholder>
    </Root>
  );
};

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

const Buttons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ErrorDetails = styled.div`
  margin-top: 0.75rem;
  max-width: 100%;
  text-align: left;
`;

const DetailsTitle = styled(SText)`
  font-size: 0.75rem;
  opacity: 0.7;
  margin-bottom: 0.25rem;
`;

const DetailsText = styled(SText)`
  margin: 0;
  font-size: 0.625rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
  opacity: 0.7;
`;
