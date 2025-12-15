import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserPath, paths } from "@/shared/routing/paths";
import { backButton, type BackButton } from "@tma.js/sdk-react";
import { useAuthUser } from "@/entities/user";

export default function BackButtonController() {
  const { data: user } = useAuthUser();
  const TAB_ROUTES: ReadonlySet<string> = new Set([
    paths.hackathons,
    paths.applications,
    getUserPath(user.id),
    paths.teams,
  ]);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const bb: BackButton = backButton;

  useEffect(() => {
    const isTab = TAB_ROUTES.has(pathname);
    if (!bb.isSupported()) return;
    if (isTab) bb.hide();
    else bb.show();
  }, [pathname]);

  const handleClick = useCallback(() => {
    if (window.history.length > 1) navigate(-1);
    else navigate(paths.hackathons, { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!bb.isSupported()) return;

    const off = bb.onClick(handleClick);
    return () => off();
  }, [handleClick]);

  return null;
}
