let cachedInitDataRaw: string | undefined;

export function setInitDataRaw(raw?: string) {
  if (typeof raw === "string" && raw.length > 0) {
    cachedInitDataRaw = raw;
  }
}

export function getInitDataRaw(): string | undefined {
  return cachedInitDataRaw;
}
