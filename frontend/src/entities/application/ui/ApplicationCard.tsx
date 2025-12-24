import { formatRegistrationDate } from "@/shared/helpers/date";
import { Role } from "@/shared/types/enums";
import { RoleBadge, SIcon, SText } from "@/shared/ui";
import { FC } from "react";
import styled from "styled-components";

interface ApplicationCardProps {
  hackathonName: string;
  registrationEndDate: Date;
  city: string;
  mode: string;
  role: Role;
  invitesCount: number;
  onNavigate: () => void;
}

export const ApplicationCard: FC<ApplicationCardProps> = ({
  city,
  hackathonName,
  invitesCount,
  mode,
  registrationEndDate,
  role,
  onNavigate,
}) => {
  return (
    <Wrapper>
      <NavigateIcon name="arrow" onClick={onNavigate} />
      <SText $fs={16} $fw={600}>
        {hackathonName}
      </SText>
      <Info>
        <InfoItem>
          <SIcon name={"hackathonRegistration"} />
          <SText $fs={14} $fw={500}>
            {formatRegistrationDate(registrationEndDate)}
          </SText>
        </InfoItem>
        <InfoItem>
          <SIcon name={"hackathonPlace"} />
          <SText $fs={14} $fw={500}>{`${city} • ${mode}`}</SText>
        </InfoItem>
      </Info>
      {invitesCount > 0 && <InvitesBadge count={invitesCount} />}
      <RoleBadge role={role}></RoleBadge>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: start;
  padding: 1rem;
  border-radius: 1rem;
  background-color: var(--tg-theme-section-bg-color);
  position: relative;
`;
const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  gap: 0.5rem;
`;

const NavigateIcon = styled(SIcon)`
  position: absolute;
  top: 1rem;
  right: 1rem;
`;

interface InvitesBadgeProps {
  count: number;
}
export const InvitesBadge: FC<InvitesBadgeProps> = ({ count }) => {
  return <Badge>{count} приглашений в команды</Badge>;
};

const Badge = styled(SText)`
  border-radius: 1.5rem;
  padding: 0.25rem 0.75rem;
  background-color: var(--tg-theme-accent-text-color);
`;
