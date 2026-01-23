import { AchievementPlace } from '../model/types';

export function formatHackPlace(place: AchievementPlace): string {
  switch (place) {
    case 'finalyst':
      return 'финалист';
    case 'participant':
      return 'участник';
    case 'firstPlace':
      return '1 место';
    case 'secondPlace':
      return '2 место';
    case 'thirdPlace':
      return '3 место';
  }
}
