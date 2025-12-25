import { FC, MouseEvent } from "react";
import styled from "styled-components";
import { Tabbar } from "@telegram-apps/telegram-ui";
import { matchPath, NavLink, useLocation } from "react-router-dom";
import { paths } from "@/shared/routing/paths";
import { SIcon } from "@/shared/ui";
import type { IconName } from "@/shared/ui/SIcon";
import { postEvent } from "@tma.js/sdk-react";

interface NavItem {
  id: number;
  name: string;
  icon: IconName;
  path: string;
}
const NAV: NavItem[] = [
  { id: 1, name: "hackathons", icon: "hacksNav", path: paths.hackathons },
  {
    id: 2,
    name: "teams",
    icon: "teamNav",
    path: paths.teams,
  },
  {
    id: 3,
    name: "applications",
    icon: "appNav",
    path: paths.applications,
  },
  { id: 4, name: "profile", icon: "profile", path: paths.userRoot },
];

export const Navbar: FC = () => {
  const { pathname } = useLocation();

  const isCurrentRoute = (to: string) => {
    return Boolean(matchPath({ path: to, end: false }, pathname));
  };

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, path: string) => {
    if (isCurrentRoute(path)) {
      e.preventDefault();
      return;
    }

    try {
      postEvent("web_app_trigger_haptic_feedback", {
        type: "impact",
        impact_style: "light",
      });
    } catch (error) {
      console.debug("Haptic feedback not available", error);
    }
  };

  return (
    <STabbar>
      {NAV.map(({ id, icon, path }) => (
        <SItem key={id}>
          <NavLink
            to={path}
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={(e) => handleNavClick(e, path)}
          >
            <SIcon name={icon} size={28} />
          </NavLink>
        </SItem>
      ))}
    </STabbar>
  );
};

const STabbar = styled(Tabbar)`
  position: static;
  box-shadow: none;
  bottom: 0;

  display: flex;
  justify-content: space-between;
  padding: 0.875rem 2rem;
  background: transparent;
`;

const SItem = styled(Tabbar.Item)`
  display: block;
  flex: unset;
  padding: 0;
  line-height: 1;
  div {
    min-width: auto;
    padding: 0;
    margin: 0;
  }
`;
