export function formatDateRange(startDate: Date, endDate: Date): string {
  const months = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ];

  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = months[date.getMonth()];
    return `${day} ${month}`;
  };

  const startFormatted = formatDate(startDate);
  const endFormatted = formatDate(endDate);

  return `${startFormatted} - ${endFormatted}`;
}

export function formatRegistrationDate(date: Date): string {
  const months = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];

  return `Регистрация до ${day} ${month}`;
}

export function getTeamMembersRange(teamMembersLimit: number, teamMembersMinimum: number): string {
  return `${teamMembersMinimum} - ${teamMembersLimit} участников`;
}

export const parseDate = (value: string): Date => new Date(value.replace(' ', 'T'));
