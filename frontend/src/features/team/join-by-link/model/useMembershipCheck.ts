import { useMyTeamOnHackathon, useTeam } from '@/entities/team';
import { User } from '@/entities/user';
import { useEffect } from 'react';

export const useMembershipCheck = (
  profile: User | null,
  teamId: number | null,
  hadAdded: boolean,
  onIsMember: () => void,
  onNotMember: () => void,
) => {
  // костыль
  if (teamId === null) {
    return;
  }
  const { data: team } = useTeam(teamId);
  const { data } = useMyTeamOnHackathon(team.hackathonId);
  useEffect(() => {
    if (!profile || !teamId || hadAdded) return;
    if (!team) return;

    const isMember = team.members.some(m => m.user.id === profile.id);

    if (isMember || data === null) {
      onIsMember();
    } else {
      onNotMember();
    }
  }, [team, profile, teamId]);
};
