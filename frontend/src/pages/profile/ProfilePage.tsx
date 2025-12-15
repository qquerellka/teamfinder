import styled from "styled-components";
import { ProfileSkillsEditor } from "@/features/profile/edit-skills/ui/ProfileSkillsEditor";
import { ProfileBioEditor } from "@/features/profile/edit-bio/ui/ProfileBioEditor";
import { AchievementItem } from "@/widgets/achievements/AchievementItem";
import { useUser } from "@/entities/user";
import { ProfileHeader } from "@/widgets/profile/ProfileHeader";
import { AchievementsListHeader } from "@/widgets/achievements/AchievementsListHeader";
import { useParams } from "react-router-dom";

export const ProfilePage = () => {

  const { id } = useParams<{ id: string }>();
  const { data: user } = useUser(Number(id));

  if (user.id !== Number(id)) {
    return <div className="">{id}</div>;
  }
  return (
    <SProfile>
      <ProfileHeader />
      <SExtraInfo>
        <ProfileSkillsEditor />
        <ProfileBioEditor />
        <div>
          <AchievementsListHeader />
          <Wrapper>
            {user?.achievements?.map((a) => (
              <AchievementItem key={a.id} achievement={a} />
            ))}
          </Wrapper>
        </div>
      </SExtraInfo>
    </SProfile>
  );
};
const Wrapper = styled.div`
  padding: 20px 22px 16px;
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
  gap: 0.5rem;
`;
export default ProfilePage;
