export const paths = {
  error404: '/404',
  root: '/',
  applications: '/applications',

  teams: '/teams',
  team: '/teams/:id',

  hackathons: '/hackathons',
  hackathon: '/hackathons/:id',
  hackathonParticipate: '/hackathons/:id/participate',
  hackathonTeam: '/hackathons/:id/team',
  hackathonCreateTeam: '/hackathons/:id/create/team',

  userRoot: '/user',
  userById: '/user/:id',
  userAchievementsRoot: '/user/achievements/new',
  userAchievement: '/user/achievements/:id',

  findNewTeamMembers: `/teams/:id/find`,
} as const;

export const getHackathonPath = (id: string) => paths.hackathon.replace(':id', String(id));

export const getTeamPath = (id: number) => paths.team.replace(':id', String(id));

export const getHackathonParticipationPath = (id: number) =>
  paths.hackathonParticipate.replace(':id', String(id));

export const getHackathonTeamPath = (id: number) => paths.hackathonTeam.replace(':id', String(id));

export const getFindTeamMembersPath = (id: string) =>
  paths.findNewTeamMembers.replace(':id', String(id));

export const getUserPath = (id: number) => {
  return paths.userById.replace(':id', String(id));
};

export const getHackathonCreateTeamPath = (id: number) =>
  paths.hackathonCreateTeam.replace(':id', String(id));

export const getUserAchievementPath = (id: number) => 
  paths.userAchievement.replace(':id', String(id));
;
