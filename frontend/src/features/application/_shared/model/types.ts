import type { Role } from '@/shared/types/enums';

export type ApplicationFormValues = {
  role: Role | '';
};

export type ApplicationFormField = keyof ApplicationFormValues;
