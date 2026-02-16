import { Role } from '@/shared/types/enums';
import {
  Application,
  ApplicationCreate,
  ApplicationCreateDTO,
  ApplicationDTO,
  ApplicationEdit,
  ApplicationEditDTO,
} from '../model/types';
import { parseDate } from '@/shared/helpers/formatters/date';

export function applicationsToCamelCase(applications: ApplicationDTO[]): Application[] {
  return applications.map(a => ({
    id: a.id,
    hackathonId: a.hackathon_id,
    userId: a.user_id,
    role: a.role as Role,
    username: a.username,
    firstName: a.first_name,
    lastName: a.last_name,
    skills: a.skills,
    registrationEndDate: parseDate(a.registration_end_date),
    status: a.status,
    city: a.city,
    mode: a.mode,
    invitesCount: a.invites_count,
    hackathonName: a.hackathon_name,
  }));
}

export function applicationCreateToDTO(payload: ApplicationCreate): ApplicationCreateDTO {
  return {
    role: payload.role,
  };
}
export function applicationEditToDTO(payload: ApplicationEdit): ApplicationEditDTO {
  return {
    role: payload.role,
  };
}
