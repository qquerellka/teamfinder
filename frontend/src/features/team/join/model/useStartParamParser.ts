import { useAuth } from '@/features/auth';
import { useLaunchParams } from '@tma.js/sdk-react';
import { useCallback, useEffect, useState } from 'react';

export const useStartParamParser = () => {
  const [teamId, setTeamId] = useState<number | null>(null);
  const { tgWebAppStartParam: startParam } = useLaunchParams();
  const { isLoading, accessToken, profile } = useAuth();
  const getHandledKey = useCallback((id: number) => `join_team_handled_${id}`, []);

  useEffect(() => {
    if (isLoading) return;
    if (!accessToken) return;
    if (!startParam?.startsWith('join_team_')) return;

    const extractedTeamId = Number(startParam.split('_')[2]);
    if (!Number.isFinite(extractedTeamId)) return;

    if (sessionStorage.getItem(getHandledKey(extractedTeamId))) return;

    setTeamId(extractedTeamId);
  }, [startParam, isLoading, accessToken, getHandledKey]);

  return {
    teamId,
    setTeamId,
    profile,
    startParam,
    getHandledKey
  };
};
