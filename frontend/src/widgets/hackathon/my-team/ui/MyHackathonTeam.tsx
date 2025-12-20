import { FC, useState } from "react";

import type { Hackathon } from "@/entities/hackathon";
import { useMyTeamOnHackathon } from "@/entities/team";

// временно используем текущие формы/карточку как есть (потом разрежем на features)
import { TeamCard } from "@/widgets/team/team-card";
import { TeamEditPanel } from "@/widgets/team/team-edit-panel";
import { CreateTeamForm } from "@/features/team/create";
import { useNavigate } from "react-router-dom";

interface MyHackathonTeamProps {
  hackathon: Hackathon;
}

export const MyHackathonTeam: FC<MyHackathonTeamProps> = ({ hackathon }) => {
  const { data: team } = useMyTeamOnHackathon(hackathon.id);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const exit = () => navigate(-1);
  // если у тебя suspense-query — сюда не попадёшь в loading
  if (team === null) return <CreateTeamForm hackathon={hackathon} />;

  if (isEditing && team) {
    return (
      <TeamEditPanel
        hackathon={hackathon}
        team={team}
        onClose={() => setIsEditing(false)}
        onExit={exit}
      />
    );
  }

  return (
    <TeamCard
      hackathon={hackathon}
      team={team}
      onEditClick={() => setIsEditing(true)}
      onExit={exit}
    />
  );
};
