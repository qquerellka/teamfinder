import { TeamWithMembers } from '@/entities/team';
import { Vacancy } from '@/entities/vacancy';
import { useDeleteVacancyForm } from '@/features/vacancy/delete/model/useDeleteVacancy';
import { ConfirmModal, RoleBadge, SIcon, SText } from '@/shared/ui';
import { IconButton } from '@telegram-apps/telegram-ui';
import { FC } from 'react';
import styled from 'styled-components';

interface VacancyCardProps {
  team: TeamWithMembers;
  vacancy: Vacancy;
  onEditClick?: () => void;
  onDeleted?: () => void;
}

export const VacancyCard: FC<VacancyCardProps> = ({ team, vacancy, onDeleted, onEditClick }) => {
  const {
    isOpen: isDeleteModalOpen,
    open: openDeleteModal,
    cancel: cancelDelete,
    confirm: confirmDelete,
    isDeleting,
  } = useDeleteVacancyForm({
    teamId: team.id,
    vacancyId: vacancy.id,
    onDone: onDeleted,
  });
  return (
    <>
      <Wrapper>
        <Header>
          <SText $fs={16} $fw={600}>
            {'Кого ищем?'}
          </SText>
          <Icons>
            <IconButton style={{ borderRadius: 6, padding: 6 }} onClick={onEditClick}>
              <SIcon name="edit" size={24} />
            </IconButton>
            <IconButton style={{ borderRadius: 6, padding: 6 }} onClick={openDeleteModal}>
              <SIcon name="delete" size={24} />
            </IconButton>
          </Icons>
        </Header>
        <RoleBadge role={vacancy.role} />
        <Info>
          <SText>{vacancy.description}</SText>
        </Info>
      </Wrapper>
      <ConfirmModal
        open={isDeleteModalOpen}
        title="Удалить вакансию?"
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
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 1rem;
  word-break: break-word;
  overflow-wrap: break-word;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
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
