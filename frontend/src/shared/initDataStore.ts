const KEY = "tf:initDataRaw";

let cachedInitDataRaw: string | undefined;

export function setInitDataRaw(raw?: string) {
  if (typeof raw === "string" && raw.length > 0) {
    cachedInitDataRaw = raw;
    try {
      sessionStorage.setItem(KEY, raw);
    } catch (e: unknown) {
      console.error(e);
    }
  }
}

export function getInitDataRaw(): string | undefined {
  if (cachedInitDataRaw) return cachedInitDataRaw;

  try {
    const raw = sessionStorage.getItem(KEY) ?? undefined;
    if (raw) cachedInitDataRaw = raw;
  } catch (e: unknown) {
    console.error(e);
  }

  return cachedInitDataRaw;
}

export function clearInitDataRaw() {
  cachedInitDataRaw = undefined;
  try {
    sessionStorage.removeItem(KEY);
  } catch (e: unknown) {
    console.error(e);
  }
}
