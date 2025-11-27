import { lazy } from "react";
import { useRoutes, type RouteObject, Navigate } from "react-router-dom";
import RootLayout from "../layouts/Layout";
import { paths } from "./paths";

const HackathonsPage = lazy(() => import("@/pages/hackathons/ui/Page"));
const HackathonPage = lazy(() => import("@/pages/hackathon/ui/Page"));
const NotificationsPage = lazy(() => import("@/pages/notifications/ui/Page"));
const ProfilePage = lazy(() => import("@/pages/profile/ui/Page"));
const NotFound = lazy(() => import("@/pages/not-found/ui/Page"));
const UserTeamsPage = lazy(() => import("@/pages/user-teams/ui/Page"));
const routes: RouteObject[] = [
  {
    path: paths.root,
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to={paths.hackathons} replace /> },

      {
        path: paths.hackathons,
        children: [
          { index: true, element: <HackathonsPage /> },
          { path: ":id", element: <HackathonPage /> },
        ],
      },

      { path: paths.notifications, element: <NotificationsPage /> },
      { path: paths.profile, element: <ProfilePage /> },
      { path: paths.teams, element: <UserTeamsPage /> },

      { path: paths.error404, element: <NotFound /> },
      { path: "*", element: <Navigate to={paths.hackathons} replace /> },
    ],
  },
];

export function AppRouter() {
  const element = useRoutes(routes);
  return element;
}
