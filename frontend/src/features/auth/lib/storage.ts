const TOKEN_PREFIX = 'tf:access_token:';

export function tokenKey(tgUserId: number) {
  return `${TOKEN_PREFIX}${tgUserId}`;
}

export function saveToken(token: string, tgUserId: number) {
  localStorage.setItem(tokenKey(tgUserId), token);
}

export function loadToken(tgUserId: number) {
  return localStorage.getItem(tokenKey(tgUserId));
}

export function clearToken(tgUserId: number) {
  localStorage.removeItem(tokenKey(tgUserId));
}
