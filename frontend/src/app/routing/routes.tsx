import { lazy } from "react";
import { useRoutes, type RouteObject, Navigate } from "react-router-dom";
import RootLayout from "../layouts/Layout";
import { paths } from "@/shared/routing/paths";
const FindTeamMemberPage = lazy(
  () => import("@/pages/teams/FindTeamMemberPage")
);

const HackathonsPage = lazy(() => import("@/pages/hackathons/HackathonsPage"));
const HackathonPage = lazy(() => import("@/pages/hackathons/HackathonPage"));
const HackathonParticipatePage = lazy(
  () => import("@/pages/hackathons/HackathonParticipatePage")
);
const HackathonTeamPage = lazy(
  () => import("@/pages/hackathons/HackathonTeamPage")
);
// const NotificationsPage = lazy(
//   () => import("@/pages/notifications/NotificationsPage")
// );

const ApplicationsPage = lazy(() => import("@/pages/applications/ApplicationsPage"))
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));
const UserTeamsPage = lazy(() => import("@/pages/teams/TeamsPage"));
const AchievementPage = lazy(
  () => import("@/pages/achievements/AchievementPage")
);
const NotFound = lazy(() => import("@/pages/not-found/NotFound"));

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
          {
            path: ":id/participate",
            element: <HackathonParticipatePage />,
          },
          {
            path: ":id/team",
            element: <HackathonTeamPage />,
          },
        ],
      },

      { path: paths.applications, element: <ApplicationsPage /> },

      {
        path: paths.profile,
        children: [
          { index: true, element: <ProfilePage /> },
          { path: "achievements/new", element: <AchievementPage /> },
          { path: "achievements/:id", element: <AchievementPage /> },
        ],
      },

      {
        path: paths.teams,
        children: [
          { index: true, element: <UserTeamsPage /> },
          { path: ":id/find", element: <FindTeamMemberPage /> },
        ],
      },

      { path: paths.error404, element: <NotFound /> },

      { path: "*", element: <Navigate to={paths.hackathons} replace /> },
    ],
  },
];

export function AppRouter() {
  return useRoutes(routes);
}
