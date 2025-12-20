import { useState } from "react";
import { useDeleteVacancy } from "@/entities/vacancy";

export function useDeleteVacancyForm(params: {
  teamId: number;
  vacancyId: number;
  onDone?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const del = useDeleteVacancy();

  const open = () => setIsOpen(true);

  const cancel = () => {
    if (del.isPending) return;
    setIsOpen(false);
  };

  const confirm = async () => {
    await del.mutateAsync({
      id: params.vacancyId,
      teamId: params.teamId,
    });
    setIsOpen(false);
    params.onDone?.();
  };

  return { isOpen, open, cancel, confirm, isDeleting: del.isPending };
}
