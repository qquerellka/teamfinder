export function getTgUserId(initDataRaw: string | null): number | null {
  if (!initDataRaw) return null;

  const params = new URLSearchParams(initDataRaw);
  const userStr = params.get('user');
  if (!userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    return typeof user?.id === 'number' ? user.id : null;
  } catch {
    return null;
  }
}
