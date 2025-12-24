import { FC } from "react";
import styled from "styled-components";
import { Tabbar } from "@telegram-apps/telegram-ui";
import { NavLink } from "react-router-dom";
import { paths } from "@/shared/routing/paths";
import { SIcon } from "@/shared/ui";
import type { IconName } from "@/shared/ui/SIcon";
import { useTelegramHaptic } from "@/shared/telegram/useTelegramHaptic";

interface NavItem {
  id: number;
  name: string;
  icon: IconName;
  path: string;
}
const NAV: NavItem[] = [
  { id: 1, name: "hackathons", icon: "hackNav", path: paths.hackathons },
  {
    id: 2,
    name: "applications",
    icon: "appNav",
    path: paths.applications,
  },
  {
    id: 3,
    name: "teams",
    icon: "teamNav",
    path: paths.teams,
  },
  { id: 4, name: "profile", icon: "profile", path: paths.userRoot },
];

export const Navbar: FC = () => {
    const { impact } = useTelegramHaptic();

  const handleNavClick =  (path: string) => {
    const currentPath = window.location.pathname;
    
    if (currentPath === path) {
      return;
    }

    impact('light');
  };

  return (
    <STabbar>
      {NAV.map(({ id, icon, path }) => (
        <SItem key={id}>
          <NavLink
            to={path}
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => handleNavClick(path)}
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
