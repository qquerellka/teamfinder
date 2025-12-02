import { lazy } from "react";
import { useRoutes, type RouteObject, Navigate } from "react-router-dom";
import RootLayout from "../layouts/Layout";
import { paths } from "./paths";

const HackathonsPage = lazy(() => import("@/pages/hackathons/HackathonsPage"));
const HackathonPage = lazy(() => import("@/pages/hackathons/HackathonPage"));
const NotificationsPage = lazy(() => import("@/pages/notifications/ui/Page"));
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));
const UserTeamsPage = lazy(() => import("@/pages/user-teams/ui/Page"));
const AchievementPage = lazy(
  () => import("@/pages/achievements/AchievementPage")
); // НОВОЕ
const NotFound = lazy(() => import("@/pages/not-found/ui/Page"));

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

      {
        path: paths.profile,
        children: [
          { index: true, element: <ProfilePage /> },
          { path: "achievements/new", element: <AchievementPage /> },
          { path: "achievements/:id", element: <AchievementPage /> }, // /profile/achievements/:id
        ],
      },

      { path: paths.teams, element: <UserTeamsPage /> },

      { path: paths.error404, element: <NotFound /> },
      { path: "*", element: <Navigate to={paths.hackathons} replace /> },
    ],
  },
];

export function AppRouter() {
  return useRoutes(routes);
}
