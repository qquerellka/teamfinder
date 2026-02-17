import { FC } from 'react';
import { Modal, Button, List, Text } from '@telegram-apps/telegram-ui';

export interface ConfirmModalProps {
  open: boolean;
  title: string;

  confirmText?: string;
  cancelText?: string;

  loading?: boolean;

  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: FC<ConfirmModalProps> = ({
  open,
  title,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !loading) {
      onCancel();
    }
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <List
        style={{
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'center',
          gap: 0,
        }}
      >
        <Text>{title}</Text>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <Button mode="bezeled" type="button" stretched disabled={loading} onClick={onCancel}>
            {cancelText}
          </Button>

          <Button type="button" stretched loading={loading} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </List>
    </Modal>
  );
};
