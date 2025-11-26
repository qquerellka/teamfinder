export interface User {
    profile: {
        id: number,
        telegramId: number,
        username: string,
        firstName: string,
        secondName: string,
        avatarUrl: string,
        bio?: string,
        city?: string,
        university?: string,
        link?: string,
        skills: Skill[],
        achievements: Achievement[],
    }
}

export interface Skill {
    id: number,
    slug: string,
    skill: string,
}

export interface Achievement {
    id: number,
    hackathon_id: number,
    role: string,
    place: AchievementPlace,
}

type AchievementPlace = 'participant' | 'finalyst' | 'thirdPlace' | 'secondPlace' | 'firstPlace';

