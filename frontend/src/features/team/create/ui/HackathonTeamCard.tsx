import { Hackathon } from "@/entities/hackathon/model/types";
import { TeamWithMembers } from "@/entities/team/model/types";
import { InputSection, SIcon, SText, STitle } from "@/shared/ui";
import { Avatar, Input, List, Textarea } from "@telegram-apps/telegram-ui";
import { FC } from "react";
import styled from "styled-components";
import editIcon from "@/assets/icons/editIcon.svg?react";
import inviteIcon from "@/assets/icons/inviteIcon.svg?react";
import profileIcon from "@/assets/icons/navbarIcons/ProfileIcon.svg?react";
import { TeamMember } from "@/entities/teamMember/model/types";

interface HacakthonTeamCardProps {
  team: TeamWithMembers;
  hackathon: Hackathon;
}

export const HackathonTeamCard: FC<HacakthonTeamCardProps> = ({
  team,
  hackathon,
}) => {
  return (
    <SExtraInfo>
      <Header>
        <SIcon icon={inviteIcon}></SIcon>
        <STitle $fs={14} $fw={500}>
          {"Моя команда"}
        </STitle>
        <SIcon icon={editIcon}></SIcon>
      </Header>
      <InputSection header={"Название"}>
        <Input value={team.name} disabled />
      </InputSection>
      <InputSection header={"Хакатон"}>
        <Input value={hackathon.name} disabled />
      </InputSection>
      <InputSection header={"Описание"}>
        <Textarea value={team.description} disabled />
      </InputSection>

      <TeamMembers>
        <HeaderRow>
          <STitle
            $fs={16}
            $fw={600}
            style={{ color: "var(--tg-theme-section-header-text-color)" }}
          >
            Участники
          </STitle>
          <CountTeamMembers className="">
            <SIcon icon={profileIcon} />
            <STitle $fs={16} $fw={700}>
              {team.members.length} / {hackathon.teamMembersLimit}
            </STitle>
          </CountTeamMembers>
        </HeaderRow>

        {team?.members?.map((m) => (
          <TeamMemberCard key={m.user.id} member={m} />
        ))}
      </TeamMembers>
    </SExtraInfo>
  );
};

const HeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 22px;
  margin-bottom: 1rem;
`;
const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const TeamMembers = styled.div`
  display: flex;
  flex-direction: column;
`;

const CountTeamMembers = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
`;
const SExtraInfo = styled(List)`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.5rem;
`;
import captainIcon from "@/assets/icons/captainIcon.svg?react"; // или твой реальный путь

interface TeamMemberCardProps {
  member: TeamMember;
}

export const TeamMemberCard: FC<TeamMemberCardProps> = ({ member }) => {
  const fullName = `${member.user.firstName ?? ""} ${
    member.user.lastName ?? ""
  }`.trim();

  return (
    <MemberRow>
      <AvatarWrapper>
        <Avatar size={40} src={member.user.avatarUrl}>
          {/* fallback — инициалы, если нужно */}
          {member.user.firstName?.[0]}
        </Avatar>
      </AvatarWrapper>

      <Info>
        <Names>
          <STitle $fs={16} $fw={600}>
            {fullName || "Без имени"}
          </STitle>
        </Names>
        <ExtraInfo>
          <SText $fs={14}>{member.role}</SText>
          {member.user.username && (
            <SText $fs={14} style={{ opacity: 0.8 }}>
              @{member.user.username}
            </SText>
          )}
        </ExtraInfo>
      </Info>

      {member.isCaptain && (
        <CaptainWrapper>
          <SIcon icon={captainIcon} color={"#F3BD28"} />
        </CaptainWrapper>
      )}
    </MemberRow>
  );
};

const MemberRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  padding: 8px 22px;
  box-sizing: border-box;

  gap: 12px;
  border-radius: 1rem;
  background-color: var(--tg-theme-section-bg-color);
`;

const AvatarWrapper = styled.div`
  flex-shrink: 0;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const Names = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: baseline;

  & > * {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const ExtraInfo = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin-top: 2px;
`;

const CaptainWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;
