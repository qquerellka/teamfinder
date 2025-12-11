import { useEffect } from "react";
import { useLaunchParams } from "@tma.js/sdk-react";
import { joinTeamMe } from "@/entities/team/api/teams";

export const StartParamJoinHandler = () => {
  const lp = useLaunchParams();
  const startParam = lp.tgWebAppStartParam;

  useEffect(() => {
    const run = async () => {
      if (!startParam?.startsWith("join_team_")) return;

      const parts = startParam.split("_");
      const teamId = Number(parts[2]);
      if (!Number.isFinite(teamId)) return;

      try {
        await joinTeamMe(teamId, "Fullstack");
      } catch (e) {
        console.error("[StartParamJoinHandler] join failed", e);
      }
    };

    run();
  }, [startParam]);

  return null;
};
