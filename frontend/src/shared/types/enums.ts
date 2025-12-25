export const roleOptions: { label: string; value: Role }[] = [
  { label: "Backend", value: "Backend" },
  { label: "Frontend", value: "Frontend" },
  { label: "Fullstack", value: "Fullstack" },
  { label: "ML", value: "ML" },
  { label: "Manager", value: "Manager" },
  { label: "Designer", value: "Designer" },
  { label: "DevOps", value: "DevOps" },
  { label: "GameDev", value: "GameDev" },
  { label: "MobileDev", value: "MobileDev" },
  { label: "Analytics", value: "Analytics" },
  { label: "QA", value: "QA" },
];

export const ROLES = [
  "DevOps",
  "GameDev",
  "MobileDev",
  "Manager",
  "DS",
  "ML",
  "Fullstack",
  "Backend",
  "Frontend",
  "Designer",
  "Analytics",
  "QA",
] as const;

export type Role = (typeof ROLES)[number];
export type HackathonMode = "online" | "offline" | "hybrid";
export type HackathonStatus = "open" | "closed"