import { FC } from "react";
import styled from "styled-components";
import { Tabbar, Image } from "@telegram-apps/telegram-ui";
import { NavLink } from "react-router-dom";

import Hack from "../../assets/icons/navbarIcons/HackathonsIcon.svg";
import Bell from "../../assets/icons/navbarIcons/NotificationsIcon.svg";
import Prof from "../../assets/icons/navbarIcons/ProfileIcon.svg";
import Team from "../../assets/icons/navbarIcons/TeamsIcon.svg";

import { paths } from "@/app/routing/paths";

const NAV = [
  { id: 1, name: "hackathons", icon: Hack, path: paths.hackathons },
  { id: 2, name: "teams", icon: Team, path: paths.teams },
  { id: 3, name: "notifications", icon: Bell, path: paths.notifications },
  { id: 4, name: "profile", icon: Prof, path: paths.profile },
];

export const Navbar: FC = () => (
  <STabbar>
    {NAV.map(({ id, icon, path }) => (
      <SItem key={id}>
        <NavLink
          to={path}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <SImage src={icon} />
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

  div {
    min-width: auto;
    padding: 0;
    margin: 0;
  }
`;

const SImage = styled(Image)`
  box-shadow: none;
  background: transparent;
`;
