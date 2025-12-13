import { useState } from "react";
import {
  useDeleteAuthUserApplication,
} from "@/entities/application";

interface UseHackathonApplicationDeleteParams {
  hackathonId: number;
  applicationId: number;
  onDeleted?: () => void;
}

export function useHackathonApplicationDelete({
  hackathonId,
  applicationId,
  onDeleted,
}: UseHackathonApplicationDeleteParams) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteMutation = useDeleteAuthUserApplication();

  const open = () => setIsOpen(true);

  const cancel = () => {
    if (deleteMutation.isPending) return;
    setIsOpen(false);
  };

  const confirm = async () => {
    await deleteMutation.mutateAsync({
      id: applicationId,
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
