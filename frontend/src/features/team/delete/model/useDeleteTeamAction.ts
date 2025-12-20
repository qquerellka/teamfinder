import { useState } from "react";
import { useDeleteTeam } from "@/entities/team";

export function useDeleteTeamAction(params: {
  hackathonId: number;
  teamId: number;
  onDone?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const del = useDeleteTeam();

  const open = () => setIsOpen(true);

  const cancel = () => {
    if (del.isPending) return;
    setIsOpen(false);
  };

  const confirm = async () => {
    await del.mutateAsync({ id: params.teamId, hackathonId: params.hackathonId });
    setIsOpen(false);
    params.onDone?.();
  };

  return { isOpen, open, cancel, confirm, isDeleting: del.isPending };
}
