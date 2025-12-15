import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { paths } from "@/shared/routing/paths";
import { backButton, type BackButton } from "@tma.js/sdk-react";

const TAB_ROUTES: ReadonlySet<string> = new Set([
  paths.hackathons,
  paths.applications,
  paths.userRoot,
  paths.teams,
]);

export default function BackButtonController() {
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
