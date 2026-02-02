import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { AchievementsListHeader, AchievementItem } from '@/widgets/achievements';
import { ProfileHeader } from '@/widgets/profile/ProfileHeader';
import { ProfileBioEditor } from '@/features/profile/edit-bio';
import { ProfileSkillsEditor } from '@/features/profile/edit-skills';
import { useAuthUser, useUser } from '@/entities/user';
import { NoItems, Page } from '@/shared/ui';

export const ProfilePage = () => {
  const { id } = useParams<{ id?: string }>();

  const { data: me } = useAuthUser();

  const viewedId = id ? Number(id) : me?.id;

  const { data: user } = useUser(viewedId ?? 0);

  const isOwner = me.id === user.id;

  return (
    <Page>
      <ProfileContainer>
        <ProfileHeader user={user} />

        <ProfileInfo>
          <ProfileSkillsEditor disabled={!isOwner} />
          <ProfileBioEditor disabled={!isOwner} />

          <ProfileAchievements>
            <AchievementsListHeader showAdd={isOwner} />
            {user?.achievements?.length > 0 ? (
              <AchievementsList>
                {user?.achievements?.map(a => (
                  <AchievementItem key={a.id} canEdit={isOwner} achievement={a} />
                ))}
              </AchievementsList>
            ) : (
              <NoItems title={'Нет достижений'} />
            )}
          </ProfileAchievements>
        </ProfileInfo>
      </ProfileContainer>
    </Page>
  );
};

const ProfileContainer = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 0;
  gap: 1.5rem;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1rem;
`;

const ProfileAchievements = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AchievementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export default ProfilePage;
