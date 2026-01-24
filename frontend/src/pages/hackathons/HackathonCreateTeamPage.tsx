import { useHackathonQuery } from '@/entities/hackathon';
import { useMyTeamOnHackathon } from '@/entities/team';
import { CreateTeamForm } from '@/features/team/create';
import { getTeamPath } from '@/shared/routing/paths';
import { Page } from '@/shared/ui';
import { useNavigate, useParams } from 'react-router-dom';

export const HackathonCreateTeamPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: hackathon } = useHackathonQuery(Number(id));
  const { data: team } = useMyTeamOnHackathon(Number(id));
  const navigate = useNavigate();
  if (team !== null) {
    navigate(getTeamPath(team.id));
  }
  return (
    <Page>
      <CreateTeamForm hackathon={hackathon} onDone={(id: number) => navigate(getTeamPath(id))} />
    </Page>
  );
};

export default HackathonCreateTeamPage;
