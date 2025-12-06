export const ACHIEVEMENT_PLACES = [
  "participant",
  "finalyst",
  "thirdPlace",
  "secondPlace",
  "firstPlace",
] as const;

export type AchievementPlace = (typeof ACHIEVEMENT_PLACES)[number];

export const placeOptions: { label: string; value: AchievementPlace }[] = [
  { label: "1 место", value: "firstPlace" },
  { label: "2 место", value: "secondPlace" },
  { label: "3 место", value: "thirdPlace" },
  { label: "Участник", value: "participant" },
  { label: "Финалист", value: "finalyst" },
];

export const roleOptions: { label: string; value: Role }[] = [
  { label: "Backend", value: "Backend" },
  { label: "Frontend", value: "Frontend" },
  { label: "Fullstack", value: "Fullstack" },
  { label: "ML", value: "ML" },
  { label: "Product Manager", value: "Product manager" },
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
  "Product manager",
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
