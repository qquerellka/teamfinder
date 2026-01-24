import { useState } from 'react';
import { useDeleteAuthUserApplication } from '@/entities/application';

export function useDeleteApplication(params: {
  hackathonId: number;
  applicationId: number;
  onDone?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const del = useDeleteAuthUserApplication();

  const open = () => setIsOpen(true);

  const cancel = () => {
    if (del.isPending) return;
    setIsOpen(false);
  };

  const confirm = async () => {
    await del.mutateAsync({
      id: params.applicationId,
      hackathonId: params.hackathonId,
    });
    setIsOpen(false);
    params.onDone?.();
  };

  return { isOpen, open, cancel, confirm, isDeleting: del.isPending };
}
