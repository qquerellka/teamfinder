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
};

export const RoleBadge = ({ role }: RoleBadgeProps) => {
  if (!role) {
    // можно вернуть null, либо плейсхолдер:
    // return <Placeholder>Роль не указана</Placeholder>;
    return null;
  }

  return (
    <StyledRoleBadge $role={role}>
      <SText $fs={16} $fw={600}>
        {role}
      </SText>
    </StyledRoleBadge>
  );
};

const StyledRoleBadge = styled.div<{ $role?: Role | null }>`
  display: flex;
  align-self: flex-start;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  border-radius: 1rem;

  ${({ $role }) => {
    const color = $role ? colorsForRoleBadge[$role] : 'var(--tg-theme-accent-text-color)';
    return `
      color: ${color};
      border: 1px solid ${color};
    `;
  }}
`;
