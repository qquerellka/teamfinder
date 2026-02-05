import type { FC, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button, Placeholder } from '@telegram-apps/telegram-ui';

interface AuthGateProps {
  children: ReactNode;
}

export const AuthGate: FC<AuthGateProps> = ({ children }) => {
  const { isError, error, refetchAuth } = useAuth();

  if (isError) {
    const message = error instanceof Error ? error.message : 'Не удалось авторизоваться';

    const isNoInitData = message.toLowerCase().includes('init_data');
    
    return (
      <Placeholder
        header="Ошибка авторизации"
        description={
          isNoInitData ? 'Откройте мини-приложение внутри Telegram и попробуйте снова.' : message
        }
      >
        <Button mode="bezeled" size="m" onClick={() => refetchAuth()}>
          Повторить
        </Button>
        <Button mode="plain" size="m" onClick={() => window.location.reload()}>
          Перезагрузить
        </Button>
      </Placeholder>
    );
  }
  return <>{children}</>;
};
