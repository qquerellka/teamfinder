export const paths = {
  error404: "/404",
  root: "/",
  hackathons: "/hackathons",
  notifications: "/notifications",
  profile: "/profile",
  teams: "/myTeams",

  hackathon: (id: string | number = ":id") => `/hackathons/${id}`,

  // базовый корень достижений
  profileAchievementsRoot: "/profile/achievements",

  // конкретное достижение
  profileAchievement: (id: string | number = ":id") =>
    `/profile/achievements/${id}`,
} as const;
