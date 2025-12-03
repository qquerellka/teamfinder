export const queryKeys = {
  user: {
    all: ["user"] as const,
    me: ["user", "me"] as const,
    byId: (id: number) => ["user", id] as const,
  },

  achievements: {
    all: ["achievements"] as const,
    me: ["achievements", "me"] as const,
    byUser: (id: number) => ["achievements", "user", id] as const,
  },

  hackathons: {
    all: ["hackathons"] as const,
    list: ["hackathons", "list"] as const,
    byId: (id: string | number) => ["hackathons", id] as const,
  },

  skills: {
    all: ["skills"] as const,
  },
} as const;
