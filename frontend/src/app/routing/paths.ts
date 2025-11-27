export const paths = {
  error404: "/404",
  root: "/",
  hackathons: "/hackathons",
  notifications: "/notifications",
  profile: "/profile",
  teams: "/myTeams",
  hackathon: (id: string | number = ":id") => `/hackathons/${id}`,
} as const;
