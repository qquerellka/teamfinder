import { FC } from 'react';
import { HackathonList } from '@/widgets/hackathon-list/ui/HackathonList';
import { Page } from '@/shared/ui';

export const HackathonsPage: FC = () => {
  return (
    <Page>
      <HackathonList />
    </Page>
  );
};

export default HackathonsPage;
