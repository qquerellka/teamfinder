import { parseDate } from '@/shared/helpers/formatters/date';
import { Hackathon, HackathonDTO } from '../model/types';

export function hackathonsToCamelCase(hackathons: HackathonDTO[]): Hackathon[] {
  return hackathons.map(h => ({
    id: h.id,
    name: h.name,
    description: h.description,
    startDate: parseDate(h.start_date),
    endDate: parseDate(h.end_date),
    registrationEndDate: parseDate(h.registration_end_date),
    mode: h.mode,
    city: h.city,
    status: h.status,
    teamMembersLimit: h.team_members_limit,
    teamMembersMinimum: h.team_members_minimum,
    registrationLink: h.registration_link,
    prizeFund: h.prize_fund,
    imageLink: h.image_link,
  }));
}
