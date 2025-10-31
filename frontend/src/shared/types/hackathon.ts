
type Mode = "online" | "offline" | "hybrid";

export interface Hackathon {
    id: number,
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    registrationEndDate: Date,
    mode: Mode,
    city: string,
    teamMembersMinimum: number,
    teamMembersLimit: number,
    registrationLink: string,
    prizeFund: number,
}
