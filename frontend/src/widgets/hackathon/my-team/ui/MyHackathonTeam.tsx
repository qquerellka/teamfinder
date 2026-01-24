import { FC, useState } from 'react';

import { TeamWithMembers } from '@/entities/team';

import { TeamCard } from '@/widgets/team/team-card';
import { TeamEditPanel } from '@/widgets/team/team-edit-panel';
import { useNavigate } from 'react-router-dom';

interface MyHackathonTeamProps {
  hackathonId: number;
  hackathonName: string;
  teamMembersLimit: number;
  team: TeamWithMembers;
}

export const MyHackathonTeam: FC<MyHackathonTeamProps> = ({ team }) => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const exit = () => navigate(-1);

  if (isEditing && team) {
    return <TeamEditPanel team={team} onClose={() => setIsEditing(false)} onExit={exit} />;
  }

  return <TeamCard team={team} onEditClick={() => setIsEditing(true)} onExit={exit} />;
};
