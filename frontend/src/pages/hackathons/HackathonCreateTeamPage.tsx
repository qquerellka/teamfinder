import { useHackathonQuery } from '@/entities/hackathon';
import { CreateTeamForm } from '@/features/team/create';
import { Page } from '@/shared/ui';
import { useNavigate, useParams } from 'react-router-dom';

export const HackathonCreateTeamPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: hackathon } = useHackathonQuery(Number(id));
  const navigate = useNavigate();
  return (
    <Page>
      <CreateTeamForm hackathon={hackathon} onDone={() => navigate('/teams')} />
    </Page>
  );
};

export default HackathonCreateTeamPage;
