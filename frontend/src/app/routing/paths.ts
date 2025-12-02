export const paths = {
  error404: "/404",
  root: "/",
  notifications: "/notifications",
  profile: "/profile",
  teams: "/myTeams",

  hackathons: "/hackathons",
  hackathon: (id: string | number = ":id") => `/hackathons/${id}`,
  
  profileAchievementsRoot: "/profile/achievements",
  profileAchievement: (id: string | number = ":id") =>
    `/profile/achievements/${id}`,
  
} as const;
