type Mode = "online" | "offline" | "hybrid";

export interface Hackathon {
  id: number;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  registrationEndDate: Date;
  mode: Mode;
  city: string;
  status: "open" | "closed";
  teamMembersMinimum: number;
  teamMembersLimit: number;
  registrationLink: string;
  prizeFund: string;
  imageLink: string;
}

// Тип с бэка (snake_case)
export interface HackathonApi {
  id: number;
  name: string;
  description: string;
  image_link: string;
  start_date: string;
  end_date: string;
  registration_end_date: string;
  mode: "online" | "offline" | "hybrid";
  city: string;
  status: "open" | "closed";
  team_members_minimum: number;
  team_members_limit: number;
  registration_link: string;
  prize_fund: string;
  created_at: string;
  updated_at: string;
}
