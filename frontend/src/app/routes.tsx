import type { ComponentType, JSX } from "react";
import { HackathonsPage } from "@/pages/HackathonsPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { ProfilePage } from "@/pages/Profile";
interface Route {
  path: string;
  Component: ComponentType<any>;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: "/", Component: HackathonsPage },
  { path: "/notifications", Component: NotificationsPage },
  { path: "/profile", Component: ProfilePage },
];
