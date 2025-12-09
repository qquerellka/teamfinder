import { FC, useState } from "react";
import { Hackathon } from "@/entities/hackathon/model/types";
import {
  useAuthUserApplicationsOnHackathon,
  useDeleteAuthUserApplication,
} from "@/entities/application/api/hooks";
import { HackathonApplicationCreateForm } from "./HackathonApplicationCreateForm";
import { HackathonApplicationCard } from "./HackathonApplicationCard";
import { HackathonApplicationEditForm } from "./HackathonApplicationEditForm";
import { ApplicationInvites } from "@/features/invite/manage-list/ui/ApplicationInvites";

import { ConfirmModal } from "@/shared/ui/ConfirmModal";

interface HackathonApplicationProps {
  hackathon: Hackathon;
}

export const HackathonApplication: FC<HackathonApplicationProps> = ({
  hackathon,
}) => {
  const { data: application } = useAuthUserApplicationsOnHackathon(
    hackathon.id
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const deleteMutation = useDeleteAuthUserApplication();

  if (!application) {
    return <HackathonApplicationCreateForm hackathon={hackathon} />;
  }

  if (isEditing) {
    return (
      <HackathonApplicationEditForm
        hackathon={hackathon}
        application={application}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    await deleteMutation.mutateAsync({
      id: application.id,
      hackathonId: hackathon.id,
    });
    setIsDeleteModalOpen(false);
  };

  const handleCancelDelete = () => {
    if (deleteMutation.isPending) return;
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <HackathonApplicationCard
        hackathon={hackathon}
        application={application}
        onEditClick={() => setIsEditing(true)}
        onDeleteClick={handleDeleteClick}
      />
      <ApplicationInvites appId={application.id} />

      <ConfirmModal
        open={isDeleteModalOpen}
        title="Удалить анкету?"
        confirmText="Удалить"
        cancelText="Отмена"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};
