import { useParams } from 'react-router-dom';
import { useAuthUser, useUser } from '@/entities/user';
import { ProfileBioEditor } from '@/features/profile/edit-bio';
import { ProfileSkillsEditor, ProfileSkillsReadonly } from '@/features/profile/edit-skills';
import { ProfileHeader } from '@/widgets/profile/ProfileHeader';
import { AchievementsListHeader, AchievementItem } from '@/widgets/achievements';
import styled from 'styled-components';
import { InputSection, NoItems, Page } from '@/shared/ui';
import { Textarea } from '@telegram-apps/telegram-ui';

export const ProfilePage = () => {
  const { id } = useParams<{ id?: string }>();

  const { data: me } = useAuthUser();

  const viewedId = id ? Number(id) : me?.id;
  const { data: user } = useUser(viewedId ?? 0);

  const isOwner = me.id === user.id;

  return (
    <Page>
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
              <ProfileSkillsReadonly skills={user.skills ?? []} />
              <ProfileBioReadonly bio={user.bio ?? ''} />
            </>
          )}
          <Achievements>
            <AchievementsListHeader showAdd={isOwner} />
            {user?.achievements?.length > 0 ? (
              <Wrapper>
                {user?.achievements?.map(a => (
                  <AchievementItem key={a.id} canEdit={isOwner} achievement={a} />
                ))}
              </Wrapper>
            ) : (
              <NoItems title={'Нет достижений'} />
            )}
          </Achievements>
        </SExtraInfo>
      </SProfile>
    </Page>
  );
};

const Achievements = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Wrapper = styled.div`
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
  gap: 1rem;
`;
export default ProfilePage;

const ProfileBioReadonly = ({ bio }: { bio: string }) => (
  <InputSection header="Обо мне">
    <Textarea value={bio} disabled />
  </InputSection>
);
