// useMembershipCheck.ts
import { TeamWithMembers } from '@/entities/team';
import { UserDTO } from '@/entities/user';
import { useEffect } from 'react';

interface UseMembershipCheckProps {
  team: TeamWithMembers | null;
  profile: UserDTO | null;
  teamId: number | null;
  hadAdded: boolean;
  onIsMember: () => void;
  onNotMember: () => void;
}

export const useMembershipCheck = ({
  team,
  profile,
  teamId,
  hadAdded,
  onIsMember,
  onNotMember,
}: UseMembershipCheckProps) => {
  useEffect(() => {
    if (!profile || !teamId || hadAdded) return;
    if (!team) return;

    const isMember = team.members.some(m => m.user.id === profile.id);

    if (isMember) {
      onIsMember();
    } else {
      onNotMember();
    }
  }, [team, profile, teamId, hadAdded, onIsMember, onNotMember]);
};
