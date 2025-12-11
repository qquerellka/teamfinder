import { FC, useState } from "react";
import { Hackathon } from "@/entities/hackathon/model/types";
import { useAuthUserApplicationsOnHackathon } from "@/entities/application/api/hooks";
import { HackathonApplicationCreateForm } from "./HackathonApplicationCreateForm";
import { HackathonApplicationCard } from "./HackathonApplicationCard";
import { HackathonApplicationEditForm } from "./HackathonApplicationEditForm";
import { ApplicationInvites } from "@/features/invite/manage-list/ui/ApplicationInvites";

import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import { useHackathonApplicationDelete } from "../hooks/useHackathonApplicationDelete";
import { useNavigate } from "react-router-dom";

interface HackathonApplicationProps {
  hackathon: Hackathon;
}

export const HackathonApplication: FC<HackathonApplicationProps> = ({
  hackathon,
}) => {
  const navigate = useNavigate();
  const { data: application } = useAuthUserApplicationsOnHackathon(
    hackathon.id
  );

  const [isEditing, setIsEditing] = useState(false);

  if (!application) {
    return <HackathonApplicationCreateForm hackathon={hackathon} />;
  }

  const {
    isOpen: isDeleteModalOpen,
    open: openDeleteModal,
    cancel: cancelDelete,
    confirm: confirmDelete,
    isLoading: isDeleting,
  } = useHackathonApplicationDelete({
    hackathonId: hackathon.id,
    applicationId: application.id,
    onDeleted: () => navigate(-1),
  });

  if (isEditing) {
    return (
      <HackathonApplicationEditForm
        hackathon={hackathon}
        application={application}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  return (
    <>
      <HackathonApplicationCard
        hackathon={hackathon}
        application={application}
        onEditClick={() => setIsEditing(true)}
        onDeleteClick={openDeleteModal}
      />

      <ApplicationInvites appId={application.id} />

      <ConfirmModal
        open={isDeleteModalOpen}
        title="Удалить анкету?"
        confirmText="Удалить"
        cancelText="Отмена"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
};
