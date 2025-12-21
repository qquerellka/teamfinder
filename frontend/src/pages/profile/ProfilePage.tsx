import { useParams } from "react-router-dom";
import { useAuthUser, useUser } from "@/entities/user";
import { ProfileBioEditor } from "@/features/profile/edit-bio";
import { ProfileSkillsEditor } from "@/features/profile/edit-skills";
import { ProfileHeader } from "@/widgets/profile/ProfileHeader";
import { InputSection, SText } from "@/shared/ui";
import { Input, Textarea } from "@telegram-apps/telegram-ui";
import { AchievementsListHeader } from "@/widgets/achievements/AchievementsListHeader";
import styled from "styled-components";
import { AchievementItem } from "@/widgets/achievements/AchievementItem";

export const ProfilePage = () => {
  const { id } = useParams<{ id?: string }>();

  const { data: me } = useAuthUser();

  const viewedId = id ? Number(id) : me?.id; // /user -> me
  const { data: user } = useUser(viewedId ?? 0); // лучше enabled, если хочешь

  if (!me || !user) return null; // Loader

  const isOwner = me.id === user.id;

  return (
    <SProfile>
      <ProfileHeader user={user} />

      <SExtraInfo>
        {isOwner ? (
          <>
            <ProfileSkillsEditor />
            <ProfileBioEditor />
          </>
        ) : (
          <>
            <ProfileSkillsReadonly skills={user.skills} />
            <ProfileBioReadonly bio={user.bio ?? ""} />
          </>
        )}
        <Achievements>
          <AchievementsListHeader showAdd={isOwner} />
          {user?.achievements?.length > 0 ? (
            <Wrapper>
              {user?.achievements?.map((a) => (
                <AchievementItem key={a.id} canEdit={isOwner} achievement={a} />
              ))}
            </Wrapper>
          ) : (
            <NotFound>
              <SText>{"Нет достижений"}</SText>
            </NotFound>
          )}
        </Achievements>
      </SExtraInfo>
    </SProfile>
  );
};

const Achievements = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NotFound = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const Wrapper = styled.div`
  /* padding: 20px 22px 16px; */
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
const SProfile = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 0;
  gap: 1.5rem;
`;

const SExtraInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1.5rem;
`;
export default ProfilePage;

const ProfileBioReadonly = ({ bio }: { bio: string }) => (
  <InputSection header="Обо мне">
    <Textarea value={bio} disabled />
  </InputSection>
);

const ProfileSkillsReadonly = ({ skills }: { skills: { name: string }[] }) => (
  <InputSection header="Навыки">
    <Input value={skills.map((s) => s.name).join(", ")} disabled />
  </InputSection>
);
