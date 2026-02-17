export const ROLES = [
  'DevOps',
  'GameDev',
  'MobileDev',
  'Manager',
  'DS',
  'ML',
  'Fullstack',
  'Backend',
  'Frontend',
  'Designer',
  'Analytics',
  'QA',
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS = {
  Backend: 'Backend',
  Frontend: 'Frontend',
  Fullstack: 'Fullstack',
  ML: 'ML',
  Manager: 'Manager',
  Designer: 'Designer',
  DevOps: 'DevOps',
  GameDev: 'GameDev',
  MobileDev: 'MobileDev',
  Analytics: 'Analytics',
  QA: 'QA',
  DS: 'DS',
} as const satisfies Record<Role, string>;

export const roleOptions = ROLES.map(role => ({
  value: role,
  label: ROLE_LABELS[role],
})) satisfies ReadonlyArray<{ label: string; value: Role }>;

export type HackathonMode = 'online' | 'offline' | 'hybrid';
export type HackathonStatus = 'open' | 'closed';

export enum EHackathonMode {
  ONLINE = 'online',
  OFFLINE = 'offline',
  HYBRID = 'hybrid',
}
