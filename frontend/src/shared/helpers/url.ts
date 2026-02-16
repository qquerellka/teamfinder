export const normalizeUrl = (urlString?: string | null): string | null => {
  if (!urlString) return null;

    if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
      return urlString;
    }

    return `https://${urlString}`;

};
