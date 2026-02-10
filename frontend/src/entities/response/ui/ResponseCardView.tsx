import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { RoleBadge, SText } from '@/shared/ui';
import { Skill } from '@/entities/skill';
import { Role } from '@/shared/types/enums';

interface ResponseCardViewProps {
  firstName: string;
  secondName: string;
  username: string;
  skills: Skill[];
  role: Role;
  actions?: React.ReactNode;
  onNavigate: () => void;
}

export const ResponsesCardView: FC<ResponseCardViewProps> = ({
  firstName,
  secondName,
  skills,
  actions,
  role,
  onNavigate,
}) => {
  const skillsString = useMemo(() => {
    const sskills = skills?.slice(0, 4) ?? [];
    return sskills.join(', ');
  }, [skills]);

  return (
    <ResponseCardContainer onClick={onNavigate}>
      <FirstRow>
        <SText $fs={16} $fw={700}>
          {firstName} {secondName}
        </SText>
        {actions}
      </FirstRow>

      <SecondRow>
        <RoleBadge role={role} />
        {/* <CountTeamMembers>
          <SIcon name="profile" />
          <SText $fs={14} $fw={500}>
            {teamMembersCount} / {teamMembersLimit}
          </SText>
        </CountTeamMembers> */}
        <SText $fs={14} $fw={500}>
          {skillsString}
        </SText>
      </SecondRow>
    </ResponseCardContainer>
  );
};

const ResponseCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 1rem;
  background-color: var(--tg-theme-section-bg-color);
`;

const FirstRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SecondRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
