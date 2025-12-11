import { FC, useState } from "react";
import { Hackathon } from "@/entities/hackathon/model/types";
import { useMyTeamOnHackathon } from "@/entities/team/api/hooks";
import { HackathonTeamCreateForm } from "./HackathonTeamCreateForm";
import { HackathonTeamCard } from "./HackathonTeamCard";

interface HackathonTeamProps {
  hackathon: Hackathon;
}

export const HackathonTeam: FC<HackathonTeamProps> = ({ hackathon }) => {
  const { data: team } = useMyTeamOnHackathon(hackathon.id);

  const [isEditing] = useState(false);

  if (!team) {
    return <HackathonTeamCreateForm hackathon={hackathon} />;
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

  if (isEditing) {
    return;
    // (
    //   <HackathonApplicationEditForm
    //     hackathon={hackathon}
    //     application={application}
    //     onClose={() => setIsEditing(false)}
    //   />
    // );
  }

  return (
    <>
      <HackathonTeamCard
        hackathon={hackathon}
        team={team}
      />
    </>
  );
};
