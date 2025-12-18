import { FC, useMemo } from "react";
import styled from "styled-components";
import { SText } from "@/shared/ui";
import { Skill } from "@/entities/skill";

interface ResponseCardViewProps {
  firstName: string;
  secondName: string;
  username: string;
  skills: Skill[],
  //   teamName: string;
  //   teamMembersCount: number;
  //   teamMembersLimit: number;
    actions?: React.ReactNode;
}

export const ResponsesCardView: FC<ResponseCardViewProps> = ({
  firstName,
  secondName,
//   username,
  skills,
  actions
}) => {

  const skillsString = useMemo(() => {
    const sskills = skills?.slice(0, 4) ?? [];
    return sskills.map((s) => s.name).join(", ");
  }, [skills]);

  return (
    <Wrapper>
      <FirstRow>
        <SText $fs={16} $fw={700}>
          Отклик
        </SText>
        {actions}
      </FirstRow>

      <SecondRow>
        <SText $fs={14} $fw={500}>
          {firstName} {secondName}
        </SText>

        {/* <CountTeamMembers>
          <SIcon name="profile" />
          <SText $fs={14} $fw={500}>
            {teamMembersCount} / {teamMembersLimit}
          </SText>
        </CountTeamMembers> */}
        <SText $fs={14} $fw={500}>{skillsString}</SText>
      </SecondRow>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
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
