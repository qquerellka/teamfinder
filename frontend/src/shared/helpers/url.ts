// @/shared/helpers/url.ts
export const normalizeUrl = (urlString?: string | null): string | null => {
  if (!urlString) return null;

  try {
    // Если URL уже содержит протокол
    if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
      return urlString;
    }

    // Добавляем https:// по умолчанию
    return `https://${urlString}`;
  } catch (error) {
    console.error('Error normalizing URL:', error, urlString);
    return null;
  }
};
