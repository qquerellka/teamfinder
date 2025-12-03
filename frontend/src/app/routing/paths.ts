export const paths = {
  error404: "/404",
  root: "/",
  applications: "/applications",
  teams: "/teams",

  hackathons: "/hackathons",
  hackathon: "/hackathons/:id",
  hackathonParticipate: "/hackathons/:id/participate",

  profile: "/profile",
  profileAchievementsRoot: "/profile/achievements",
  profileAchievement: "/profile/achievements/:id",
} as const;

export const getHackathonPath = (id: string) =>
  paths.hackathon.replace(":id", String(id));

export const getHackathonParticipationPath = (id: string) =>
  paths.hackathonParticipate.replace(":id", String(id));