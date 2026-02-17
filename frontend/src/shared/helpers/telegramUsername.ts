export function isValidTelegramUsername(username?: string): boolean {
  if (!username) return false;

  const telegramUsernameRegex = /^[a-zA-Z0-9](?!.*?__)[a-zA-Z0-9_]{3,30}[a-zA-Z0-9]$/;

  return telegramUsernameRegex.test(username);
}

export function sanitizeTelegramUsername(username?: string): string | null {
  if (!username) return null;

  const sanitized = username.replace(/[^a-zA-Z0-9_]/g, '');

  if (sanitized.length < 5 || sanitized.length > 32) return null;
  if (sanitized.startsWith('_') || sanitized.endsWith('_')) return null;
  if (sanitized.includes('__')) return null;

  return sanitized.toLowerCase();
}

export function createSafeTelegramLink(username?: string): string | null {
  const safeUsername = sanitizeTelegramUsername(username);
  return safeUsername ? `https://t.me/${safeUsername}` : null;
}
