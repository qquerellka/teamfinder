import styled from 'styled-components';
import { Role } from '../types/enums';
import { SText } from './SText';

const colorsForRoleBadge: Record<Role, string> = {
  DevOps: '#CE8AFF',
  GameDev: '#B16DFF',
  MobileDev: '#8AB3FF',
  Manager: '#8AE2FF',
  DS: '#A9FF8A',
  ML: '#FFF78A',
  Fullstack: '#FF978A',
  Backend: '#FF8A8B',
  Frontend: '#FFC28A',
  Designer: '#8F8AFF',
  Analytics: '#8AFFC6',
  QA: '#939BA7',
};

type RoleBadgeProps = {
  role?: Role | null;
  size?: 's' | 'm';
};

export const RoleBadge = ({ role, size = 'm' }: RoleBadgeProps) => {
  if (!role) {
    return null;
  }

  return (
    <StyledRoleBadge $role={role} $size={size}>
      <SText $fs={size === 's' ? 12 : 16} $fw={600}>
        {role}
      </SText>
    </StyledRoleBadge>
  );
};

const StyledRoleBadge = styled.div<{ $role?: Role | null; $size?: 's' | 'm' }>`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;

  ${({ $size }) => {
    switch ($size) {
      case 's':
        return `
          padding: 0.25rem 0.75rem;
          border-radius: 0.75rem;
        `;
      case 'm':
      default:
        return `
          padding: 0.5rem 0.75rem;
          border-radius: 1rem;
        `;
    }
  }}

  ${({ $role }) => {
    const color = $role ? colorsForRoleBadge[$role] : 'var(--tg-theme-accent-text-color)';
    return `
      color: ${color};
      border: 1px solid ${color};
    `;
  }}
`;
