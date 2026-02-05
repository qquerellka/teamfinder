import { apiClient } from '@/shared/api/client';
import { AuthResponse, AuthResponseDTO } from '../model/types';
import { resolveInitDataRaw } from '@/shared/resolveInitDataRaw';
import { getTgUserId } from '../lib/getTgUserId';
import { authResponseToCamelCase } from '../lib/dto';

const AUTH_STORAGE_PREFIX = 'tf:auth_token:';

function tokenKey(tgUserId: number) {
  return `${AUTH_STORAGE_PREFIX}${tgUserId}`;
}

function saveAccessToken(token: string) {
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
}

function saveAuthToStorage(data: AuthResponse, tgUserId: number) {
  const token = data.accessToken;
  localStorage.setItem(tokenKey(tgUserId), token);
  saveAccessToken(token);
}


export async function authDev(): Promise<AuthResponse> {
  const body = {
    telegram_id: 0,
    username: 'teamfinder',
    first_name: 'Андрей',
    last_name: 'Денисович',
    avatar_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Albert_Einstein_Head_cleaned.jpg/330px-Albert_Einstein_Head_cleaned.jpg',
  };

  const { data } = await apiClient.post<AuthResponseDTO>('/auth/dev-login', body);
  saveAuthToStorage(authResponseToCamelCase(data), 0);
  return authResponseToCamelCase(data);
}

export async function authTelegram(): Promise<AuthResponse> {
  console.log('1) получение строки initData');
  const initDataRaw = resolveInitDataRaw();
  if (!initDataRaw) throw new Error('No init_data for tgAuth');

  console.log('2) получение id пользователя по initData');
  const tgUserId = getTgUserId(initDataRaw);
  if (!tgUserId) throw new Error('Cannot parse tg user id from init_data');
  
  console.log('3) вызов ручки авторизации');
  const { data } = await apiClient.post<AuthResponseDTO>('/auth/telegram', {
    init_data: initDataRaw,
  });

  console.log('4) сохранение токена в localStorage и добавление Bearer в заголовок');
  saveAuthToStorage(authResponseToCamelCase(data), tgUserId);
  return authResponseToCamelCase(data);
}

export async function authQueryFn(): Promise<AuthResponse> {
  console.log('authQueryFn');
  const forceDevLogin = import.meta.env.VITE_FORCE_DEV_LOGIN === '1' || import.meta.env.DEV;

  if (forceDevLogin) return authDev();

  // получение строки initData
  const initDataRaw = resolveInitDataRaw();
  if (!initDataRaw) throw new Error('No init_data for tgAuth');

  const tgUserId = getTgUserId(initDataRaw);
  if (!tgUserId) throw new Error('Cannot parse tg user id from init_data');

  return authTelegram();
}
