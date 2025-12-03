import { apiClient } from "@/shared/api/client";
import { resolveInitDataRaw } from "@/shared/resolveInitDataRow";
import { AuthResponse } from "../model/types";
import axios from "axios";



const AUTH_STORAGE_KEY = "auth";

export async function authDev(): Promise<AuthResponse> {
  const body = {
    telegram_id: 0,
    username: "teamfinder",
    first_name: "Team",
    last_name: "Finder",
    avatar_url:
      "https://storage.yandexcloud.net/teamfinder-hackathons-images/hackathons/1/cover.jpg",

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

async function fetchProfile(): Promise<AuthResponse["profile"]> {
  const { data } = await apiClient.get<AuthResponse["profile"]>("/users/me");
  return data;

}

function clearAuthStorage() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  delete apiClient.defaults.headers.common.Authorization;
}

export async function authQueryFn(): Promise<AuthResponse> {
  const token = restoreTokenFromStorage();

  if (token) {
    try {
      const profile = await fetchProfile();
      return {
        access_token: token,
        profile,
      };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // тут err: AxiosError
        const status = err.response?.status;

        // если хочешь чистить только на 401/403:
        if (status === 401 || status === 403) {
          clearAuthStorage();
        } else {
          // например, на 500/timeout можно пробросить ошибку наверх
          throw err;
        }
      } else {
        // не axios-ошибка — пробрасываем
        throw err;
      }

      // если дошли до сюда, значит токен протух, всё почистили и пойдём дальше по флоу
    }
  }

  const isTMA = !!window?.Telegram?.WebApp;
  const forceDevLogin =
    import.meta.env.VITE_FORCE_DEV_LOGIN === "1" || import.meta.env.DEV;

  if (!isTMA && forceDevLogin) {
    return authDev();
  }

  return authTelegram();
}