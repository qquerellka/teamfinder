// import { useEffect, useRef } from 'react';
// import { useLaunchParams } from '@tma.js/sdk-react';
// import { joinTeamMe } from '@/entities/team';
// import { Role } from '@/shared/types/enums';
// import { useAuth } from '@/features/auth';

// export const StartParamJoinHandler = () => {
//   const lp = useLaunchParams();
//   const startParam = lp.tgWebAppStartParam;
//   const { isLoading, accessToken, profile } = useAuth();
//   const hasJoinedRef = useRef(false);
//   console.log("startParamHandler", profile)
//   useEffect(() => {
//     if (hasJoinedRef.current) return;
//     if (isLoading) return;
//     if (!accessToken) return;

//     if (!startParam?.startsWith('join_team_')) return;

//     const parts = startParam.split('_');
//     const teamId = Number(parts[2]);
//     if (!Number.isFinite(teamId)) return;

//     console.log("teamId", teamId);
//     const run = async () => {
//       try {
//         await joinTeamMe(teamId, 'Fullstack' as Role);
//         hasJoinedRef.current = true;
//         console.log('[StartParamJoinHandler] joined team', teamId);
//         // тут можно сделать refetch команды / навигацию
//       } catch (e) {
//         console.error('[StartParamJoinHandler] join failed', e);
//       }
//     };

//     run();
//   }, [startParam, isLoading, accessToken]);

//   return null;
// };
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useLaunchParams } from '@tma.js/sdk-react';
import { joinTeamMe } from '@/entities/team';
import { Role, roleOptions } from '@/shared/types/enums';
import { useAuth } from '@/features/auth';
import { useNavigate } from 'react-router-dom';
import { getTeamPath } from '@/shared/routing/paths';
import { InputSection, SText } from '@/shared/ui';
import { Button, List, Modal, Select } from '@telegram-apps/telegram-ui';

export const StartParamJoinHandler = () => {
  const navigate = useNavigate();
  const lp = useLaunchParams();
  const startParam = lp.tgWebAppStartParam;
  const { isLoading, accessToken, profile } = useAuth();
  const hasJoinedRef = useRef(false);
  console.log('startParamHandler', profile);

  const [modalOpen, setModalOpen] = useState(false);
  const [role, setRole] = useState<Role | ''>('Fullstack');
  const [teamId, setTeamId] = useState<number | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  const parseRole = (raw: string): Role | '' => (raw ? (raw as Role) : '');

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    setRole(parseRole(e.target.value));
  };
  const clearStartParam = () => {
    try {
      // 1. Очищаем URL query параметры
      const url = new URL(window.location.href);
      const cleanUrl = `${url.origin}${url.pathname}${url.hash}`;
      window.history.replaceState({}, '', cleanUrl);

      // 2. Очищаем launchParams из sessionStorage
      const launchParamsKey = 'tapps/launchParams';
      const launchParamsStr = sessionStorage.getItem(launchParamsKey);

      if (launchParamsStr) {
        try {
          const launchParams = JSON.parse(launchParamsStr);

          // Удаляем tgWebAppStartParam из launchParams
          if (launchParams.includes('tgWebAppStartParam=')) {
            // Удаляем параметр из строки launchParams
            const updatedParams = launchParams
              .replace(/(?:&|^)tgWebAppStartParam=[^&]*/, '')
              .replace(/^&/, '');

            sessionStorage.setItem(launchParamsKey, JSON.stringify(updatedParams));
          }
        } catch (e) {
          console.error('Error parsing launchParams:', e);
        }
      }

      // 3. Также очищаем initDataRaw если там есть start param
      const initDataKey = 'tf:initDataRaw';
      const initDataStr = sessionStorage.getItem(initDataKey);

      if (initDataStr && initDataStr.includes('start_param')) {
        sessionStorage.removeItem(initDataKey);
      }

      console.log('Start param cleared from all locations');
    } catch (error) {
      console.error('Error clearing start param:', error);
    }
  };

  const handleJoinTeam = async () => {
    if (!teamId || !role) {
      console.error('Team ID or role is missing');
      return;
    }

    setIsJoining(true);
    try {
      await joinTeamMe(teamId, role as Role);
      hasJoinedRef.current = true;
      console.log('[StartParamJoinHandler] joined team', teamId);
      setModalOpen(false);
      setHasProcessed(true);

      clearStartParam();

      navigate(getTeamPath(teamId));
    } catch (e) {
      console.error('[StartParamJoinHandler] join failed', e);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setHasProcessed(true);
    clearStartParam();

    navigate('/hackathons');
  };
  useEffect(() => {
    if (hasProcessed) return;
    if (hasJoinedRef.current) return;
    if (isLoading) return;
    if (!accessToken) return;

    if (!startParam?.startsWith('join_team_')) return;

    const parts = startParam.split('_');
    const extractedTeamId = Number(parts[2]);
    if (!Number.isFinite(extractedTeamId)) return;

    console.log('teamId', extractedTeamId);
    setTeamId(extractedTeamId);
    setModalOpen(true);
  }, [startParam, isLoading, accessToken, hasProcessed]);

  return (
    <Modal open={modalOpen} title={'Выбор роли'}>
      <List
        style={{
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'center',
          gap: 0,
        }}
      >
        <SText>{'Выбор роли'}</SText>
        <InputSection header={'Роль'}>
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
          <Button
            mode="bezeled"
            type="button"
            stretched
            onClick={handleJoinTeam}
            disabled={isJoining || !role}
          >
            {isJoining ? 'Присоединение...' : 'Присоединиться'}
          </Button>

          <Button type="button" stretched onClick={handleCancel}>
            {'Отмена'}
          </Button>
        </div>
      </List>
    </Modal>
  );
};
