import { SegmentedControl } from '@telegram-apps/telegram-ui';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Page } from '@/shared/ui';
import { useTeam } from '@/entities/team';
import { TeamVacancies } from '@/widgets/team/team-vacancy';
import { TeamApplications } from '@/widgets/team/applications-list';

export const FindTeamMemberPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: team } = useTeam(Number(id));
  const [tab, setTab] = useState<'vacancy' | 'applications'>('vacancy');

  return (
    <Page>
      <SegmentedControl style={{ margin: '1rem 0' }}>
        <SegmentedControl.Item selected={tab === 'vacancy'} onClick={() => setTab('vacancy')}>
          Вакансия
        </SegmentedControl.Item>
        <SegmentedControl.Item
          selected={tab === 'applications'}
          onClick={() => setTab('applications')}
        >
          Анкеты
        </SegmentedControl.Item>
      </SegmentedControl>

      {tab === 'vacancy' && <TeamVacancies team={team} />}

      {tab === 'applications' && <TeamApplications team={team} />}
    </Page>
  );
};
export default FindTeamMemberPage;
