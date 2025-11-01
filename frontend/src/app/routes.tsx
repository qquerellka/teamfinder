import { lazy } from "react";
import { useRoutes, type RouteObject, Navigate } from "react-router-dom";
import RootLayout from "./Layout";
import { paths } from "./paths";

const HackathonsPage = lazy(() => import("@/pages/HackathonsPage"));
const HackathonPage = lazy(() => import("@/pages/HackathonPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const ProfilePage = lazy(() => import("@/pages/Profile"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const UserTeamsPage = lazy(() => import("@/pages/UserTeamsPage"));
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
