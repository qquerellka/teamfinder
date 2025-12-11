import { useEffect, useRef } from "react";
import { useLaunchParams } from "@tma.js/sdk-react";
import { joinTeamMe } from "@/entities/team/api/teams";
import { Role } from "@/shared/types/enums";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const StartParamJoinHandler = () => {
  const lp = useLaunchParams();
  const startParam = lp.tgWebAppStartParam;
  const { isLoading, accessToken } = useAuth();
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (hasJoinedRef.current) return;
    if (isLoading) return;
    if (!accessToken) return;

    if (!startParam?.startsWith("join_team_")) return;

    const parts = startParam.split("_");
    const teamId = Number(parts[2]);
    if (!Number.isFinite(teamId)) return;

    const run = async () => {
      try {
        await joinTeamMe(teamId, "Fullstack" as Role);
        hasJoinedRef.current = true;
        console.log("[StartParamJoinHandler] joined team", teamId);
        // тут можно сделать refetch команды / навигацию
      } catch (e) {
        console.error("[StartParamJoinHandler] join failed", e);
      }
    };

    run();
  }, [startParam, isLoading, accessToken]);

  return null;
};
