import { FC } from 'react';
import { Text } from '@telegram-apps/telegram-ui';
import styled from 'styled-components';
import { pluralizeInvites } from '../helpers/formatters/pluralize';

interface InvitesBadgeProps {
  count: number;
}
export const InvitesBadge: FC<InvitesBadgeProps> = ({ count }) => {
  return <Badge>{count} {pluralizeInvites(count, "приглашение", "приглашения", "приглашений")} в команды</Badge>;
};

const Badge = styled(Text)`
  border-radius: 1.5rem;
  padding: 0.25rem 0.75rem;
  color: var(--tg-theme-section-bg-color);
  background-color: var(--tg-theme-accent-text-color);
`;
