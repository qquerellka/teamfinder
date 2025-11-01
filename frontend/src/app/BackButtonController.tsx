import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { backButton } from "@tma.js/sdk-react";
import { paths } from "./paths";

const TAB_ROUTES: ReadonlySet<string> = new Set([
  paths.hackathons,
  paths.notifications,
  paths.profile,
  paths.teams,
]);

export default function BackButtonController() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // На таб-страницах скрываем кнопку, на внутренних — показываем
  useEffect(() => {
    const isTab = TAB_ROUTES.has(pathname);
    try {
      isTab ? backButton.hide() : backButton.show();
    } catch { /* noop */ }
  }, [pathname]);

  const handleClick = useCallback(() => {
    if (window.history.length > 1) navigate(-1);
    else navigate(paths.hackathons, { replace: true });
  }, [navigate]);

  // совместимость разных версий sdk-react
  useEffect(() => {
    const bb: any = backButton;

    if (typeof bb.onClick === "function") {
      bb.onClick(handleClick);
      return () => bb.offClick?.(handleClick);
    }

    bb.on?.("click", handleClick);
    return () => bb.off?.("click", handleClick);
  }, [handleClick]);

  return null;
}
