import { apiClient } from "@/shared/api/client";
import { resolveInitDataRaw } from "@/shared/resolveInitDataRow";
import { AuthResponse } from "../model/types";
import axios from "axios";
import { retrieveLaunchParams } from "@tma.js/sdk-react";

const AUTH_STORAGE_KEY = "auth";

export async function authDev(): Promise<AuthResponse> {
  console.log("dev");
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
  const lp = retrieveLaunchParams();
  const raw = resolveInitDataRaw();

  console.log("[LP] platform:", lp.tgWebAppPlatform);
  console.log("[LP] from SDK:", lp.initDataRaw);
  console.log("[RAW] from TG:", window.Telegram?.WebApp?.initData);
  console.log(
    "[RAW] from URL:",
    new URLSearchParams(location.hash.slice(1)).get("tgWebAppData") ||
      new URLSearchParams(location.search).get("tgWebAppData")
  );
  console.log("[RESOLVED] initDataRaw:", raw);
  const a =
    new URLSearchParams(location.hash.slice(1)).get("tgWebAppData") ||
    new URLSearchParams(location.search).get("tgWebAppData");
  //   const debug =
  //     (lp.tgWebAppStartParam || "").includes("debug") || import.meta.env.DEV;

  const initDataRaw = resolveInitDataRaw();
  if (!initDataRaw) {
    throw new Error("No init_data for tgAuth");
  }
  const response = await apiClient.post<AuthResponse>("/auth/telegram", {
    init_data: a,
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
  if (typeof window === "undefined" || !("localStorage" in window)) {
    console.log("[auth] no localStorage, skip restore");
    return null;
  }

  const token = window.localStorage.getItem(AUTH_STORAGE_KEY);
  console.log("[auth] restoreTokenFromStorage ->", token);
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
  console.log("[auth]  start");
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
        if (status === 401 || status === 403) {
          clearAuthStorage();
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
  }

  const isTMA = !!window?.Telegram?.WebApp;
  const forceDevLogin =
    import.meta.env.VITE_FORCE_DEV_LOGIN === "1" || import.meta.env.DEV;

  // ВАЖНО: если включили dev-режим — всегда идём в dev-логин
  if (forceDevLogin) {
    return authDev();
  }

  // Если dev-логин не форсим и Telegram-окружения нет — считаем это ошибкой
  if (!isTMA) {
    throw new Error("No Telegram environment for auth");
  }

  return authTelegram();
}
