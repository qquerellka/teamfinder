import type { Role } from "@/shared/types/enums";

export type VacancyFormValues = {
  role: Role;
  description: string
};

export type VacancyFormField = keyof VacancyFormValues;
