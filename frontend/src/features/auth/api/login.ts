import { apiClient } from "@/shared/api/client";
import { resolveInitDataRaw } from "@/shared/resolveInitDataRow";
import { AuthResponse, UserResponse } from "../model/types";

const AUTH_STORAGE_KEY = "auth";

export async function authDev(): Promise<AuthResponse> {
  const body = {
    telegram_id: 0,
    username: "string",
    first_name: "string",
    last_name: "string",
    avatar_url: "string",
  };

  const response = await apiClient.post<AuthResponse>("/auth/dev-login", body);
  const data = response.data;
  saveAuthToStorage(data);
  return data;
}

export async function authTelegram(): Promise<AuthResponse> {
  const initDataRaw = resolveInitDataRaw();
  if (!initDataRaw) {
    throw new Error("No init_data for tgAuth");
  }
  const response = await apiClient.post<AuthResponse>("/auth/telegram", {
    init_data: initDataRaw,
  });
  const data = response.data;
  saveAuthToStorage(data);
  return data;
}

function saveAccessToken(token: string) {
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
}

function saveAuthToStorage(data: AuthResponse) {
  const token = data.access_token;
  localStorage.setItem(AUTH_STORAGE_KEY, token);
  saveAccessToken(token);
}

function restoreTokenFromStorage(): string | null {
  const token = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!token) return null;

  saveAccessToken(token);
  return token;
}


async function fetchProfile(): Promise<UserResponse> {
  const resp = await apiClient.get<UserResponse>("/users/me");
  return resp.data;
}

export async function authQueryFn(): Promise<AuthResponse> {
  const token = restoreTokenFromStorage();

  if (token) {
    const profile = await fetchProfile();
    return { access_token: token, profile };
  }

  const isTMA = !!window?.Telegram?.WebApp;
  const forceDevLogin =
    import.meta.env.VITE_FORCE_DEV_LOGIN === "1" || import.meta.env.DEV;

  if (!isTMA && forceDevLogin) {
    const data = await authDev();
    return data;
  }

  const data = await authTelegram();
  return data;
}