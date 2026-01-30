import styled from 'styled-components';
import { IconButton } from '@telegram-apps/telegram-ui';
import { useMemo, type FC } from 'react';

import type { Hackathon } from '@/entities/hackathon';
import type { Application } from '@/entities/application';
import { formatRegistrationDate } from '@/shared/helpers/date';
import { RoleBadge, SIcon, SText } from '@/shared/ui';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { useDeleteApplication } from '@/features/application/delete';

interface MyApplicationCardProps {
  hackathon: Hackathon;
  application: Application;
  onEditClick?: () => void;
  onDeleted?: () => void; // важно
}

export const MyApplicationCard: FC<MyApplicationCardProps> = ({
  hackathon,
  application,
  onEditClick,
  onDeleted,
}) => {
  const {
    isOpen: isDeleteModalOpen,
    open: openDeleteModal,
    cancel: cancelDelete,
    confirm: confirmDelete,
    isDeleting,
  } = useDeleteApplication({
    hackathonId: hackathon.id,
    applicationId: application.id,
    onDone: onDeleted, // единый стиль
  });
  const skillsString = useMemo(() => {
    const skills = application.skills?.slice(0, 4) ?? [];
    return skills.map(s => s.name).join(', ');
  }, [application.skills]);
  return (
    <>
      <Wrapper>
        <Header>
          <SText $fs={16} $fw={600}>
            {hackathon.name}
          </SText>

          <Icons>
            <IconButton style={{ borderRadius: 6, padding: 6 }} onClick={onEditClick}>
              <SIcon name="edit"  size={24}/>
            </IconButton>
            <IconButton style={{ borderRadius: 6, padding: 6 }} onClick={openDeleteModal}>
              <SIcon name="delete" size={24}/>
            </IconButton>
          </Icons>
        </Header>
        <Info>
          <InfoItem>
            <SIcon name="hackathonRegistration" />
            <SText $fs={14} $fw={500}>
              {formatRegistrationDate(hackathon.registrationEndDate)}
            </SText>
          </InfoItem>
          <InfoItem>
            <SText $fs={14} $fw={500}>
              {skillsString}
            </SText>
          </InfoItem>
        </Info>

        <RoleBadge role={application.role} />
      </Wrapper>

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

const Wrapper = styled.div`
  background-color: var(--tg-theme-section-bg-color);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1rem;
`;
const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
`;
const Header = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const Icons = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
`;

// const IconButton = styled(Button).attrs({ mode: 'plain', size: 's' })`
//   padding: 0;
//   min-width: auto;
// `;
