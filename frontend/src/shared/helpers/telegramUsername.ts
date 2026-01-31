export function isValidTelegramUsername(username?: string): boolean {
  if (!username) return false;
  
  // Telegram username rules:
  // - 5-32 characters
  // - Only letters, numbers, underscores
  // - Cannot start or end with underscore
  // - Cannot have consecutive underscores
  // - Case insensitive (but usually lowercase)
  const telegramUsernameRegex = /^[a-zA-Z0-9](?!.*?__)[a-zA-Z0-9_]{3,30}[a-zA-Z0-9]$/;
  
  return telegramUsernameRegex.test(username);
}

export function sanitizeTelegramUsername(username?: string): string | null {
  if (!username) return null;
  
  // Удаляем все недопустимые символы
  const sanitized = username.replace(/[^a-zA-Z0-9_]/g, '');
  
  // Проверяем правила Telegram
  if (sanitized.length < 5 || sanitized.length > 32) return null;
  if (sanitized.startsWith('_') || sanitized.endsWith('_')) return null;
  if (sanitized.includes('__')) return null;
  
  return sanitized.toLowerCase();
}

// Хелпер для создания безопасной ссылки
export function createSafeTelegramLink(username?: string): string | null {
  const safeUsername = sanitizeTelegramUsername(username);
  return safeUsername ? `https://t.me/${safeUsername}` : null;
}