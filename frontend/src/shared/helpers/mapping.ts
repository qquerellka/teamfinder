import { Hackathon, HackathonApi } from "@/entities/hackathon/model/types";

const parseDate = (value: string): Date => new Date(value.replace(" ", "T"));

export function mapHackathon(dto: HackathonApi): Hackathon {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    imageLink: dto.image_link,
    startDate: parseDate(dto.start_date),
    endDate: parseDate(dto.end_date),
    registrationEndDate: parseDate(dto.registration_end_date),
    mode: dto.mode,
    status: dto.status,
    city: dto.city,
    teamMembersMinimum: dto.team_members_minimum,
    teamMembersLimit: dto.team_members_limit,
    registrationLink: dto.registration_link,
    prizeFund: dto.prize_fund,
  };
}
