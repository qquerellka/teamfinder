import { ChangeEvent, useEffect, useState, useCallback } from 'react';
import { useLaunchParams } from '@tma.js/sdk-react';
import { joinTeamMe, useTeam } from '@/entities/team';
import { Role, roleOptions } from '@/shared/types/enums';
import { useAuth } from '@/features/auth';
import { useNavigate } from 'react-router-dom';
import { getTeamPath } from '@/shared/routing/paths';
import { InputSection, SText } from '@/shared/ui';
import { Button, List, Modal, Select } from '@telegram-apps/telegram-ui';

export const StartParamJoinHandler = () => {
  const navigate = useNavigate();
  const { tgWebAppStartParam: startParam } = useLaunchParams();
  const { isLoading, accessToken, profile } = useAuth();

  const [teamId, setTeamId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [role, setRole] = useState<Role | ''>('');
  const [isJoining, setIsJoining] = useState(false);

  const getHandledKey = useCallback((id: number) => `join_team_handled_${id}`, []);

  /* ---------- startParam parsing ---------- */

  useEffect(() => {
    if (isLoading) return;
    if (!accessToken) return;
    if (!startParam?.startsWith('join_team_')) return;

    const extractedTeamId = Number(startParam.split('_')[2]);
    if (!Number.isFinite(extractedTeamId)) return;

    if (sessionStorage.getItem(getHandledKey(extractedTeamId))) return;

    setTeamId(extractedTeamId);
  }, [startParam, isLoading, accessToken, getHandledKey]);

  /* ---------- team loading ---------- */

  const teamQuery = useTeam(teamId || undefined);
  const team = teamQuery.data; // будет null если teamId undefined

  /* ---------- membership check ---------- */

  useEffect(() => {
    if (!team || !profile || !teamId) return;

    const isMember = team.members.some(m => m.user.id === profile.id);

    if (isMember) {
      sessionStorage.setItem(getHandledKey(teamId), '1');
      setModalOpen(false);
      return;
    }

    setModalOpen(true);
  }, [team, profile, teamId, getHandledKey]);

  /* ---------- handlers ---------- */

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as Role);
  };

  const handleJoinTeam = async () => {
    if (!teamId || !role || isJoining) return;

    setIsJoining(true);
    try {
      await joinTeamMe(teamId, role);
      sessionStorage.setItem(getHandledKey(teamId), '1');
      setModalOpen(false);
      navigate(getTeamPath(teamId));
    } catch (e) {
      console.error('[StartParamJoinHandler] join failed', e);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCancel = () => {
    if (teamId) {
      sessionStorage.setItem(getHandledKey(teamId), '1');
    }
    setModalOpen(false);
    navigate('/hackathons');
  };

  /* ---------- render ---------- */

  if (!modalOpen) return null;

  return (
    <Modal open title="Выбор роли">
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
          <Select value={role} onChange={handleSelect}>
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
          <Button mode="bezeled" stretched onClick={handleJoinTeam} disabled={isJoining || !role}>
            {isJoining ? 'Присоединение...' : 'Присоединиться'}
          </Button>

          <Button stretched onClick={handleCancel}>
            Отмена
          </Button>
        </div>
      </List>
    </Modal>
  );
};
