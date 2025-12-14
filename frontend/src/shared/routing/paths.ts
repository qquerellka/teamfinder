export const paths = {
  error404: "/404",
  root: "/",
  applications: "/applications",
  teams: "/teams",

  hackathons: "/hackathons",
  hackathon: "/hackathons/:id",
  hackathonParticipate: "/hackathons/:id/participate",
  hackathonTeam: "/hackathons/:id/team",

  profile: "/profile",
  profileAchievementsRoot: "/profile/achievements/new",
  profileAchievement: "/profile/achievements/:id",

  findNewTeamMembers: `/teams/:id/find`
} as const;

export const getHackathonPath = (id: string) =>
  paths.hackathon.replace(":id", String(id));

export const getHackathonParticipationPath = (id: string) =>
  paths.hackathonParticipate.replace(":id", String(id));

export const getHackathonTeamPath = (id: number) =>
  paths.hackathonTeam.replace(":id", String(id));

export const getFindTeamMembersPath = (id: string) =>
  paths.findNewTeamMembers.replace(":id", String(id));