import { AchievementPlace } from "@/entities/achievement/model/types";

export function formatDateRange(startDate: Date, endDate: Date): string {
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];

  // Форматируем обе даты
  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = months[date.getMonth()]; // Получаем месяц из массива
    return `${day} ${month}`;
  };

  const startFormatted = formatDate(startDate);
  const endFormatted = formatDate(endDate);

  return `${startFormatted} - ${endFormatted}`;
}

export function formatRegistrationDate(date: Date): string {
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];

  return `Регистрация до ${day} ${month}`;
}

export function getTeamMembersRange(
  teamMembersLimit: number,
  teamMembersMinimum: number
): string {
  if (isNaN(teamMembersMinimum) || isNaN(teamMembersLimit)) {
    throw new Error("Invalid input values");
  }

  return `${teamMembersMinimum} - ${teamMembersLimit} участников`;
}

export function formatHackPlace(place: AchievementPlace): string {
  switch (place) {
    case "finalyst":
      return "финалист"
    case "participant":
      return "участник"
    case "firstPlace":
      return "1 место"
    case "secondPlace":
      return "2 место"
    case "thirdPlace":
      return "3 место"
    
  }

}
