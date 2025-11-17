import { FC } from "react";
import styled from "styled-components";
import { Tabbar } from "@telegram-apps/telegram-ui";
import { NavLink } from "react-router-dom";

import HackIcon from "../../assets/icons/navbarIcons/HackathonsIcon.svg?react";
import BellIcon from "../../assets/icons/navbarIcons/NotificationsIcon.svg?react";
import ProfIcon from "../../assets/icons/navbarIcons/ProfileIcon.svg?react";
import TeamIcon from "../../assets/icons/navbarIcons/TeamsIcon.svg?react";
import { paths } from "@/app/routing/paths";
import { SIcon } from "@/shared/ui/SIcon";

const NAV = [
  { id: 1, name: "hackathons", icon: HackIcon, path: paths.hackathons },
  {
    id: 2,
    name: "teams",
    icon: TeamIcon,
    path: paths.teams,
  },
  {
    id: 3,
    name: "notifications",
    icon: BellIcon,
    path: paths.notifications,
  },
  { id: 4, name: "profile", icon: ProfIcon, path: paths.profile },
];

export const Navbar: FC = () => (
  <STabbar>
    {NAV.map(({ id, icon, path }) => (
      <SItem key={id}>
        <NavLink
          to={path}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <SIcon icon={icon} size={28} color={'transparent'} />
        </NavLink>
      </SItem>
    ))}
  </STabbar>
);

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
