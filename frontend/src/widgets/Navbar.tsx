// Navbar.tsx
import styled from "styled-components";
import { Tabbar, Image } from "@telegram-apps/telegram-ui";
import { useState } from "react";
import Hack from "../../assets/icons/hackathonsPageIcon.svg";
import Bell from "../../assets/icons/NotificationsIcon.svg";
import Prof from "../../assets/icons/ProfileIcon.svg";

const STabbar = styled(Tabbar)`

  position: sticky;
  bottom: 0;
  background: var(--tg-theme-secondary-bg-color, #fff);

`;

const SItem = styled(Tabbar.Item)<{ $active?: boolean }>`
  display: grid;
  justify-items: center;
  gap: 4px;
  padding: 0;
  color: ${({ $active }) =>
    $active
      ? "var(--tg-theme-accent-text-color, #2481cc)"
      : "var(--tg-theme-hint-color, #8e8e93)"};

  svg {
    width: 24px;
    height: 24px;
  }
`;

const NAV = [
  { id: 1, name: "hackathons", icon: Hack },
  { id: 2, name: "notifications", icon: Bell },
  { id: 3, name: "profile", icon: Prof },
];

export const Navbar = () => {
  const [active, setActive] = useState(1);
  return (
    <STabbar>
      {NAV.map(({ id, icon }) => (
        <SItem
          key={id}
          $active={active === id} // transient-prop, не уедет в DOM
          selected={active === id}
          onClick={() => setActive(id)}
        >
          <Image src={icon} />
        </SItem>
      ))}
    </STabbar>
  );
};
