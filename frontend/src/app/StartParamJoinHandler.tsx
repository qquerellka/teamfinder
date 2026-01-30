// import { ChangeEvent, useEffect, useState, useCallback } from 'react';
// import { useLaunchParams } from '@tma.js/sdk-react';
// import { useTeam, useJoinTeam } from '@/entities/team'; // Импортируем хук
// import { Role, roleOptions } from '@/shared/types/enums';
// import { useAuth } from '@/features/auth';
// import { useNavigate } from 'react-router-dom';
// import { getTeamPath } from '@/shared/routing/paths';
// import { InputSection, SIcon, SText } from '@/shared/ui';
// import { Button, IconButton, List, Modal, Placeholder, Select } from '@telegram-apps/telegram-ui';

// export const StartParamJoinHandler = () => {
//   const navigate = useNavigate();
//   const { tgWebAppStartParam: startParam } = useLaunchParams();
//   const { isLoading, accessToken, profile } = useAuth();

//   const [teamId, setTeamId] = useState<number | null>(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [teamModalOpen, setTeamModalOpen] = useState(false);
//   const [role, setRole] = useState<Role | ''>('');

//   const getHandledKey = useCallback((id: number) => `join_team_handled_${id}`, []);

//   // Используем хук для присоединения к команде
//   const joinTeamMutation = useJoinTeam();

//   /* ---------- startParam parsing ---------- */

//   useEffect(() => {
//     if (isLoading) return;
//     if (!accessToken) return;
//     if (!startParam?.startsWith('join_team_')) return;

//     const extractedTeamId = Number(startParam.split('_')[2]);
//     if (!Number.isFinite(extractedTeamId)) return;

//     if (sessionStorage.getItem(getHandledKey(extractedTeamId))) return;

//     setTeamId(extractedTeamId);
//   }, [startParam, isLoading, accessToken, getHandledKey]);

//   /* ---------- team loading ---------- */

//   const teamQuery = useTeam(teamId || undefined);
//   const team = teamQuery.data;

//   /* ---------- membership check ---------- */

//   useEffect(() => {
//     if (!profile || !teamId) return;
//     if (!team) return;

//     const isMember = team.members.some(m => m.user.id === profile.id);

//     if (isMember) {
//       sessionStorage.setItem(getHandledKey(teamId), '1');
//       setModalOpen(false);
//       setTeamModalOpen(true);
//     } else {
//       setModalOpen(true);
//     }
//   }, [team, profile, teamId, getHandledKey]);

//   /* ---------- handlers ---------- */

//   const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
//     setRole(e.target.value as Role);
//   };

//   const handleJoinTeam = async () => {
//     if (!teamId || !role) return;

//     try {
//       await joinTeamMutation.mutateAsync({ id: teamId, role });
//       sessionStorage.setItem(getHandledKey(teamId), '1');
//       setModalOpen(false);
//       navigate(getTeamPath(teamId));
//     } catch (e) {
//       console.error('[StartParamJoinHandler] join failed', e);
//     }
//   };

//   const handleCancel = () => {
//     if (teamId) {
//       sessionStorage.setItem(getHandledKey(teamId), '1');
//     }
//     setModalOpen(false);
//     navigate('/hackathons');
//   };

//   /* ---------- render ---------- */

//   if (!modalOpen && !teamModalOpen) return null;

//   return (
//     <>
//       <Modal open={modalOpen} title="Выбор роли">
//         <List
//           style={{
//             padding: 16,
//             display: 'flex',
//             flexDirection: 'column',
//             textAlign: 'center',
//             gap: 0,
//           }}
//         >
//           <SText>Выбор роли</SText>

//           <InputSection header="Роль">
//             <Select value={role} onChange={handleSelect}>
//               <option value="" disabled>
//                 Выберите роль
//               </option>
//               {roleOptions.map(opt => (
//                 <option key={opt.value} value={opt.value}>
//                   {opt.label}
//                 </option>
//               ))}
//             </Select>
//           </InputSection>

//           <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
//             <Button
//               stretched
//               onClick={handleJoinTeam}
//               disabled={joinTeamMutation.isPending || !role}
//             >
//               {joinTeamMutation.isPending ? 'Присоединение...' : 'Присоединиться'}
//             </Button>

//             <Button mode="bezeled" stretched onClick={handleCancel}>
//               Отмена
//             </Button>
//           </div>
//         </List>
//       </Modal>

//       <Modal
//         open={teamModalOpen}
//         header={
//           <Modal.Header
//             after={
//               <Modal.Close>
//                 <IconButton
//                   onClick={() => {
//                     if (teamId) {
//                       sessionStorage.setItem(getHandledKey(teamId), '1');
//                     }
//                     setTeamModalOpen(false);
//                     navigate(getTeamPath(teamId!));
//                   }}
//                 >
//                   <SIcon name="cross" size={16} color="#F55A5A" />
//                 </IconButton>
//               </Modal.Close>
//             }
//           ></Modal.Header>
//         }
//       >
//         <Placeholder
//           description="У вас уже есть команда на этот хакатон"
//           header="Не получиться присоединиться"
//         >
//           <img
//             alt="Telegram sticker"
//             src="https://xelene.me/telegram.gif"
//             style={{
//               display: 'block',
//               height: '144px',
//               width: '144px',
//             }}
//           />
//         </Placeholder>
//       </Modal>
//     </>
//   );
// };



import { ChangeEvent, useEffect, useState, useCallback } from 'react';
import { useLaunchParams } from '@tma.js/sdk-react';
import { useTeam, useJoinTeam } from '@/entities/team';
import { Role, roleOptions } from '@/shared/types/enums';
import { useAuth } from '@/features/auth';
import { useNavigate } from 'react-router-dom';
import { getTeamPath } from '@/shared/routing/paths';
import { InputSection, SIcon, SText } from '@/shared/ui';
import { Button, IconButton, List, Modal, Placeholder, Select } from '@telegram-apps/telegram-ui';

export const StartParamJoinHandler = () => {
  const navigate = useNavigate();
  const { tgWebAppStartParam: startParam } = useLaunchParams();
  const { isLoading, accessToken, profile } = useAuth();

  const [teamId, setTeamId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [role, setRole] = useState<Role | ''>('');
  const [hasProcessed, setHasProcessed] = useState(false); // Флаг обработки

  const getHandledKey = useCallback((id: number) => `join_team_handled_${id}`, []);

  const joinTeamMutation = useJoinTeam();

  /* ---------- startParam parsing ---------- */

  useEffect(() => {
    if (isLoading) return;
    if (!accessToken) return;
    if (!startParam?.startsWith('join_team_')) return;

    const extractedTeamId = Number(startParam.split('_')[2]);
    if (!Number.isFinite(extractedTeamId)) return;

    if (sessionStorage.getItem(getHandledKey(extractedTeamId))) return;

    setTeamId(extractedTeamId);
    setHasProcessed(false); // Сбрасываем флаг при новом teamId
  }, [startParam, isLoading, accessToken, getHandledKey]);

  /* ---------- team loading ---------- */

  const teamQuery = useTeam(teamId || undefined);
  const team = teamQuery.data;

  /* ---------- membership check ---------- */

  useEffect(() => {
    if (hasProcessed) return;
    if (!profile || !teamId) return;
    if (!team) return;

    const isMember = team.members.some(m => m.user.id === profile.id);

    if (isMember) {
      sessionStorage.setItem(getHandledKey(teamId), '1');
      setModalOpen(false);
      setTeamModalOpen(true);
      setHasProcessed(true);
    } else {
      setModalOpen(true);
    }
  }, [team, profile, teamId, getHandledKey, hasProcessed]);

  /* ---------- handlers ---------- */

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as Role);
  };

  const handleJoinTeam = async () => {
    if (!teamId || !role) return;

    try {
      await joinTeamMutation.mutateAsync({ id: teamId, role });
      setHasProcessed(true);
      sessionStorage.setItem(getHandledKey(teamId), '1');
      setModalOpen(false);
      navigate(getTeamPath(teamId));
    } catch (e) {
      console.error('[StartParamJoinHandler] join failed', e);
    }
  };

  const handleCancel = () => {
    if (teamId) {
      sessionStorage.setItem(getHandledKey(teamId), '1');
      setHasProcessed(true);
    }
    setModalOpen(false);
    navigate('/hackathons');
  };

  const handleCloseAlreadyMember = () => {
    if (teamId) {
      sessionStorage.setItem(getHandledKey(teamId), '1');
      setHasProcessed(true);
    }
    setTeamModalOpen(false);
    navigate(getTeamPath(teamId!));
  };

  /* ---------- render ---------- */

  if (!modalOpen && !teamModalOpen) return null;

  return (
    <>
      <Modal open={modalOpen} title="Выбор роли">
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
            <Button
              stretched
              onClick={handleJoinTeam}
              disabled={joinTeamMutation.isPending || !role}
            >
              {joinTeamMutation.isPending ? 'Присоединение...' : 'Присоединиться'}
            </Button>

            <Button mode="bezeled" stretched onClick={handleCancel}>
              Отмена
            </Button>
          </div>
        </List>
      </Modal>

      <Modal
        open={teamModalOpen}
        header={
          <Modal.Header
            after={
              <Modal.Close>
                <IconButton onClick={handleCloseAlreadyMember}>
                  <SIcon name="cross" size={16} color="#F55A5A" />
                </IconButton>
              </Modal.Close>
            }
          >
            <SText>Информация</SText>
          </Modal.Header>
        }
      >
        <Placeholder description="Вы уже являетесь участником этой команды" header="Уже в команде">
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
        <div style={{ padding: 16, paddingTop: 0 }}>
          <Button stretched onClick={handleCloseAlreadyMember}>
            Перейти к команде
          </Button>
        </div>
      </Modal>
    </>
  );
};
