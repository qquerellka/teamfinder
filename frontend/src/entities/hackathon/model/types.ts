import { HackathonMode, HackathonStatus } from '@/shared/types/enums';

export interface Hackathon {
  id: number;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  registrationEndDate: Date;
  mode: HackathonMode;
  city: string;
  status: HackathonStatus;
  teamMembersMinimum: number;
  teamMembersLimit: number;
  registrationLink: string;
  prizeFund: number;
  imageLink: string;
}

export interface HackathonDTO {
  id: number;
  name: string;
  description: string;
  image_link: string;
  start_date: string;
  end_date: string;
  registration_end_date: string;
  mode: HackathonMode;
  city: string;
  status: HackathonStatus;
  team_members_minimum: number;
  team_members_limit: number;
  registration_link: string;
  prize_fund: number;
  created_at: string;
  updated_at: string;
}
