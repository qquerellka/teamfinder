// допустимые места
export const ACHIEVEMENT_PLACES = [
  "participant",
  "finalyst",
  "thirdPlace",
  "secondPlace",
  "firstPlace",
] as const;

export type AchievementPlace = (typeof ACHIEVEMENT_PLACES)[number];

// роли
export const ACHIEVEMENT_ROLES = [
  "Backend",
  "Frontend",
  "Fullstack",
  "Data",
  "Product",
  "Designer",
] as const;

export type AchievementRole = (typeof ACHIEVEMENT_ROLES)[number];


export const placeOptions: { label: string; value: AchievementPlace }[] = [
  { label: "1 место", value: "firstPlace" },
  { label: "2 место", value: "secondPlace" },
  { label: "3 место", value: "thirdPlace" },
  { label: "Участник", value: "participant" },
];

export const roleOptions: { label: string; value: AchievementRole }[] = [
  { label: "Backend", value: "Backend" },
  { label: "Frontend", value: "Frontend" },
  { label: "Fullstack", value: "Fullstack" },
  { label: "Data / ML", value: "Data" },
  { label: "Product", value: "Product" },
  { label: "Designer", value: "Designer" },
];