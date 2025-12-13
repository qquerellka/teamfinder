import { Hackathon } from "@/entities/hackathon";
import { TeamWithMembers } from "@/entities/team";
import { InputSection, SIcon, SText } from "@/shared/ui";
import {
  Avatar,
  Button,
  Input,
  Textarea,
} from "@telegram-apps/telegram-ui";
import { FC, useState } from "react";
import styled from "styled-components";

import { TeamMember } from "@/entities/teamMember";
import { getTeamJoinLink } from "@/entities/team";

interface TeamCardProps {
  team: TeamWithMembers;
  hackathon: Hackathon;
  onEditClick: () => void;
}

export const TeamCard: FC<TeamCardProps> = ({
  team,
  hackathon,
  onEditClick,
}) => {
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { data: user } = useAuthUser();
  const handleCopyInviteLink = async () => {
    try {
      setIsCopying(true);

      const url = await getTeamJoinLink(team.id);

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("[TeamCard] failed to copy invite link", e);
    } finally {
      setIsCopying(false);
    }
  };
  const leaveMutaion = useLeaveTeam(team.id);

  const onLeaveTeam = async () => {
    await leaveMutaion.mutateAsync();
    navigate(-1);
  };

  return (
    <>
      <SExtraInfo>
        {team.captainId === user.id ? (
          <Header>
            <SIcon name={"invite"} />
            <SText $fs={14} $fw={500}>
              {"Моя команда"}
            </SText>
            <SIcon onClick={onEditClick} name={"edit"} />
          </Header>
        ) : (
          <Header>
            <div className=""></div>
            <SText $fs={14} $fw={500}>
              {"Моя команда"}
            </SText>
            <SIcon onClick={onLeaveTeam} name={"leaveTeam"} />
          </Header>
        )}

        <InputSection header={"Хакатон"}>
          <Input value={hackathon.name} disabled />
        </InputSection>
        <InputSection header={"Название"}>
          <Input value={team.name} disabled />
        </InputSection>
        <InputSection header={"Описание"}>
          <Textarea value={team.description} disabled />
        </InputSection>

        <TeamMembers>
          <HeaderRow>
            <SText
              $fs={16}
              $fw={600}
              style={{ color: "var(--tg-theme-section-header-text-color)" }}
            >
              Участники
            </SText>
            <CountTeamMembers>
              <SIcon name={"profile"} />
              <SText $fs={16} $fw={700}>
                {team.members.length} / {hackathon.teamMembersLimit}
              </SText>
            </CountTeamMembers>
          </HeaderRow>
          <TeamMemberCards>
            {team?.members?.map((m) => (
              <TeamMemberCard key={m.user.id} member={m} team={team} />
            ))}
          </TeamMemberCards>
        </TeamMembers>

        <ButtonsSection>
          <SButton
            mode="bezeled"
            onClick={handleCopyInviteLink}
            stretched
            disabled={isCopying}
          >
            {copied ? "Ссылка скопирована" : "Пригласить по ссылке"}
          </SButton>
          <SButton
            onClick={() => navigate(getFindTeamMembersPath(String(team.id)))}
            stretched
            disabled={isCopying}
          >
            {"Найти участников"}
          </SButton>
        </ButtonsSection>
      </SExtraInfo>
    </>
  );
};

const SExtraInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ButtonsSection = styled.div`
  margin-top: auto;
  padding-bottom: env(safe-area-inset-bottom, 0);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
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

const TeamMemberCards = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
`;

import { useNavigate } from "react-router-dom";
import { getFindTeamMembersPath } from "@/shared/routing/paths";
import { useAuthUser } from "@/entities/user";
import {
  useDeleteTeamMember,
  useLeaveTeam,
} from "@/entities/teamMember";

interface TeamMemberCardProps {
  team: TeamWithMembers;
  member: TeamMember;
}

export const TeamMemberCard: FC<TeamMemberCardProps> = ({ member, team }) => {
  const navigate = useNavigate();
  const fullName = `${member.user.firstName ?? ""} ${
    member.user.lastName ?? ""
  }`.trim();
  const removeMemberMutation = useDeleteTeamMember(team.id, member.user.id);

  const onDelete = async () => {
    await removeMemberMutation.mutateAsync();
    navigate(-1);
  };

  return (
    <MemberRow>
      <AvatarWrapper>
        <Avatar size={40} src={member.user.avatarUrl}>
          {member.user.firstName?.[0]}
        </Avatar>
      </AvatarWrapper>

      <Info>
        <Names>
          <SText $fs={16} $fw={600}>
            {fullName || "Без имени"}
          </SText>
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

      {member.isCaptain ? (
        <CaptainWrapper>
          <SIcon name={"captain"} color={"#F3BD28"} />
        </CaptainWrapper>
      ) : (
        <CaptainWrapper>
          <SIcon onClick={onDelete} name={"cross"} color={"#F55A5A"} />
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
  /* margin: 0 22px; */

  padding: 8px 22px;
  box-sizing: border-box;

  gap: 12px;
  border-radius: 1rem;
  background-color: var(--tg-theme-section-bg-color);
`;

const AvatarWrapper = styled.div`
  flex-shrink: 0;
`;
const SButton = styled(Button)`
  width: 100%;
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
