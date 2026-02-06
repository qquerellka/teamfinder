import { TeamWithMembers } from '@/entities/team';
import { User } from '@/entities/user';
import { useEffect } from 'react';

export const useMembershipCheck = (
  team: TeamWithMembers | null,
  profile: User | null,
  teamId: number | null,
  hadAdded: boolean,
  onIsMember: () => void,
  onNotMember: () => void,
) => {
  useEffect(() => {
    if (!profile || !teamId || hadAdded) return;
    if (!team) return;

    const isMember = team.members.some(m => m.user.id === profile.id);

    if (isMember) {
      onIsMember();
    } else {
      onNotMember();
    }
  }, [team, profile, teamId]);
};
// [team, profile, teamId, hadAdded, onIsMember, onNotMember]