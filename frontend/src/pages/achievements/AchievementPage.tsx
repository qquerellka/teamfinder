import { useNavigate, useParams } from 'react-router-dom';

import { paths } from '@/shared/routing/paths';
import { AchievementContainer } from '@/widgets/achievements';
import { Page } from '@/shared/ui';

export const AchievementPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <Page>
      <AchievementContainer id={id} onDone={() => navigate(paths.userRoot)} />
    </Page>
  );
};

export default AchievementPage;
