export const queryKeys = {
  user: {
    all: ['user'] as const,
    me: ['user', 'me'] as const,
    byId: (id: number) => ['user', id] as const,
  },

  achievements: {
    all: ['achievements'] as const,
    me: ['achievements', 'me'] as const,
    byUser: (id: number) => ['achievements', 'user', id] as const,
  },

  hackathons: {
    all: ['hackathons'] as const,
    list: ['hackathons', 'list'] as const,
    byId: (id: string | number) => ['hackathons', id] as const,
  },

  skills: {
    all: ['skills'] as const,
  },

  applications: {
    all: ['applications'] as const,
    byHackathon: (hackathonId: number) => ['applications', 'hackathon', hackathonId] as const,
    me: ['applications', 'me'] as const,
    meByHackathon: (hackathonId: number) =>
      ['applications', 'me', 'hackathon', hackathonId] as const,
    byId: (id: number) => ['applications', id] as const,
  },

  teams: {
    all: ['teams'] as const,
    byHackathon: (hackathonId: number) => ['teams', 'hackathon', hackathonId] as const, // GET /hackathons/{id}/teams
    me: ['teams', 'me'] as const, // GET /me/teams
    meByHackathon: (hackathonId: number) => ['teams', 'me', 'hackathon', hackathonId] as const, // GET /hackathons/{id}/teams/me
    byId: (id: number) => ['teams', id] as const, // GET /teams/{id}
    members: (teamId: number) => ['teams', teamId, 'members'] as const,
  },
  vacancies: {
    all: ['vacancies'] as const,
    byTeam: (teamId: number) => ['vacancies', 'team', teamId] as const,
    byHackathon: (hackathonId: number) => ['vacancies', 'hackathon', hackathonId] as const,
    byId: (id: number) => ['vacancies', id] as const,
  },
  responses: {
    all: ['responses'] as const, // /me/responses
    byVacancy: (vacancyId: number) => ['responses', 'vacancy', vacancyId] as const,
    me: ['responses', 'me'] as const,
    byId: (id: number) => ['responses', id] as const,
  },
  invites: {
    all: ['invites'] as const,
    byTeam: (teamId: number) => ['invites', 'team', teamId] as const,
    byApplication: (applicationId: number) => ['invites', 'application', applicationId] as const,
    me: ['invites', 'me'] as const,
    byId: (id: number) => ['invites', id] as const,
  },
} as const;
