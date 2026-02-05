import { useTeam } from '@/entities/team';
import { roleOptions } from '@/shared/types/enums';
import { useNavigate } from 'react-router-dom';
import { getTeamPath } from '@/shared/routing/paths';
import { InputSection, SIcon, SText } from '@/shared/ui';
import { Button, IconButton, List, Modal, Placeholder, Select } from '@telegram-apps/telegram-ui';
import { useHaveTeamModal } from '../model/useHaveTeamModal';
import { useJoinTeamModal } from '../model/useJoinTeamModal';
import { useStartParamParser } from '../model/useStartParamParser';
import { useMembershipCheck } from '../model/useMembershipCheck';

export const StartParamJoinHandler = () => {
  const navigate = useNavigate();
  const navigateToTeam = () => navigate(getTeamPath(teamId!));
  const navigateToHackathons = () => navigate('/hackathons');

  const { teamId, profile, getHandledKey } = useStartParamParser();
  const teamQuery = useTeam(teamId || undefined);

  const haveTeamModal = useHaveTeamModal(teamId, navigateToTeam, getHandledKey);
  const joinTeamModal = useJoinTeamModal(
    teamId,
    getHandledKey,
    navigateToHackathons,
    navigateToTeam,
  );

  useMembershipCheck({
    team: teamQuery.data,
    profile,
    teamId,
    hadAdded: joinTeamModal.hadAdded,
    onIsMember: () => {
      sessionStorage.setItem(getHandledKey(teamId!), '1');
      joinTeamModal.close();
      haveTeamModal.open();
    },
    onNotMember: () => {
      joinTeamModal.open();
    },
  });

  if (!joinTeamModal.modalOpen && !haveTeamModal.modalOpen) return null;

  return (
    <>
      <Modal open={joinTeamModal.modalOpen} title="Выбор роли">
        <List
          style={{
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'center',
            gap: 0,
          }}
        >
          <SText>Выбор роли</SText>

          <InputSection header="Роль">
            <Select value={joinTeamModal.role} onChange={joinTeamModal.select}>
              <option value="" disabled>
                Выберите роль
              </option>
              {roleOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </InputSection>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Button
              stretched
              onClick={joinTeamModal.joinTeam}
              disabled={joinTeamModal.isLoading || !joinTeamModal.role}
            >
              {joinTeamModal.isLoading ? 'Присоединение...' : 'Присоединиться'}
            </Button>

            <Button mode="bezeled" stretched onClick={joinTeamModal.cancel}>
              Отмена
            </Button>
          </div>
        </List>
      </Modal>

      <Modal
        open={haveTeamModal.modalOpen}
        header={
          <Modal.Header
            after={
              <Modal.Close>
                <IconButton onClick={haveTeamModal.close}>
                  <SIcon name="cross" size={16} color="#F55A5A" />
                </IconButton>
              </Modal.Close>
            }
          ></Modal.Header>
        }
      >
        <Placeholder
          description="У вас уже есть команда на этот хакатон"
          header="Не получиться присоединиться"
        >
          <img
            alt="Telegram sticker"
            src="https://xelene.me/telegram.gif"
            style={{
              display: 'block',
              height: '144px',
              width: '144px',
            }}
          />
        </Placeholder>
      </Modal>
    </>
  );
};
