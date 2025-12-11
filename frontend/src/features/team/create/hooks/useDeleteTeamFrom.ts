import { useDeleteTeam } from "@/entities/team/api/hooks";
import { useState } from "react";

interface UseHackathonApplicationDeleteParams {
  hackathonId: number;
  teamId: number;
  onDeleted?: () => void;
}

export function useDeleteTeamForm({
  hackathonId,
  teamId,
  onDeleted,
}: UseHackathonApplicationDeleteParams) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteMutation = useDeleteTeam();

  const open = () => setIsOpen(true);

  const cancel = () => {
    if (deleteMutation.isPending) return;
    setIsOpen(false);
  };

  const confirm = async () => {
    await deleteMutation.mutateAsync({
      id: teamId,
      hackathonId,
    });
    setIsOpen(false);
    onDeleted?.();
  };

  return {
    isOpen,
    open,
    cancel,
    confirm,
    isLoading: deleteMutation.isPending,
  };
}
