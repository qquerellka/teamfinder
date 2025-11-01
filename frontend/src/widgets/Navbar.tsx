import { FC } from "react";
import styled from "styled-components";
import { Tabbar, Image } from "@telegram-apps/telegram-ui";
import { NavLink } from "react-router-dom";

import Hack from "../../assets/icons/hackathonsPageIcon.svg";
import Bell from "../../assets/icons/NotificationsIcon.svg";
import Prof from "../../assets/icons/ProfileIcon.svg";
import { paths } from "@/app/paths";

const NAV = [
  { id: 1, name: "hackathons", icon: Hack, path: paths.hackathons },
  { id: 2, name: "notifications", icon: Bell, path: paths.notifications },
  { id: 3, name: "profile", icon: Prof, path: paths.profile },
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
  position: sticky;
  bottom: 0;
  background: var(--tg-theme-section-bg-color, #fff);
`;

const SItem = styled(Tabbar.Item)`
  a {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
    color: var(--tg-theme-hint-color, #8e8e93);
    text-decoration: none;
    transition: color 0.2s ease;

    img {
      
    }
  }
  
  a.active {
    color: var(--tg-theme-accent-text-color, #2481cc);
  }
`;

const SImage = styled(Image)`
  box-shadow: none;
  background: var(--tg-theme-section-bg-color, #fff);
`