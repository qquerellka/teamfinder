import { apiClient } from "@/shared/api/client";
import { AuthResponse } from "../model/types";
import axios from "axios";
import { resolveInitDataRaw } from "@/shared/resolveInitDataRaw";

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
  console.log("initDataRaw in authTelegram:", initDataRaw);

  if (!initDataRaw) {
    throw new Error("No init_data for tgAuth");
  }

  const { data } = await apiClient.post<AuthResponse>("/auth/telegram", {
    init_data: initDataRaw,
  });

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
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return null;
  }

  const token = window.localStorage.getItem(AUTH_STORAGE_KEY);
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
        const status = err.response?.status;
        if (status === 401 || status === 403 || status === 404) {
          clearAuthStorage();
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
  }

  const forceDevLogin =
    import.meta.env.VITE_FORCE_DEV_LOGIN === "1" || import.meta.env.DEV;

  // ВАЖНО: если включили dev-режим — всегда идём в dev-логин
  if (forceDevLogin) {
    return authDev();
  }
  return authTelegram();
}
