import { ReactNode } from 'react';
import { Subheadline } from '@telegram-apps/telegram-ui';

export const ErrorText = ({ children }: { children: ReactNode }) => {
  return (
    <Subheadline weight="2" style={{ color: `var(--tg-theme-destructive-text-color)` }}>
      {children}
    </Subheadline>
  );
};
