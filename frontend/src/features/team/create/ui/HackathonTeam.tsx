import { FC, useState } from "react";
import { Hackathon } from "@/entities/hackathon/model/types";
import { useMyTeamOnHackathon } from "@/entities/team/api/hooks";
import { CreateTeamForm } from "./TeamCreateForm";
import { TeamEditForm } from "./TeamEditForm";
import { TeamCard } from "./TeamCard";

interface HackathonTeamProps {
  hackathon: Hackathon;
}

export const HackathonTeam: FC<HackathonTeamProps> = ({ hackathon }) => {
  const { data: team } = useMyTeamOnHackathon(hackathon.id);

  const [isEditing, setIsEditing] = useState(false);

  if (team === null) {
    return <CreateTeamForm hackathon={hackathon} />;
  }

  // const {
  //   isOpen: isDeleteModalOpen,
  //   open: openDeleteModal,
  //   cancel: cancelDelete,
  //   confirm: confirmDelete,
  //   isLoading: isDeleting,
  // } = useHackathonApplicationDelete({
  //   hackathonId: hackathon.id,
  //   applicationId: application.id,
  //   onDeleted: () => navigate(-1),
  // });

  if (isEditing && team !== null) {
    return (
      <TeamEditForm
        hackathon={hackathon}
        team={team}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  return <TeamCard onEditClick={() => setIsEditing(true)} hackathon={hackathon} team={team} />;
};
