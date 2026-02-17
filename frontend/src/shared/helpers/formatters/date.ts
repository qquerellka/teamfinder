const MONTHS = [
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
export function formatDateRange(startDate: Date, endDate: Date): string {
  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = MONTHS[date.getMonth()];
    return `${day} ${month}`;
  };

  const startFormatted = formatDate(startDate);
  const endFormatted = formatDate(endDate);

  return `${startFormatted} - ${endFormatted}`;
}

export function formatRegistrationDate(date: Date): string {
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];

  return `Регистрация до ${day} ${month}`;
}

export const parseDate = (value: string): Date => new Date(value.replace(' ', 'T'));
