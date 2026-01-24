import { ReactNode } from 'react';
import { SText } from './SText';

export const ErrorText = ({ children }: { children: ReactNode }) => {
  return (
    <SText $fs={14} $fw={500} style={{ color: `var(--tg-theme-destructive-text-color)` }}>
      {children}
    </SText>
  );
};
