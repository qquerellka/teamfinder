// import { apiClient } from "@/shared/api/client";
// import { AuthResponse } from "../model/types";
// import axios from "axios";
// import { resolveInitDataRaw } from "@/shared/resolveInitDataRaw";
// import { getInitDataRaw } from "@/shared/initDataStore";
// import { getTgUserId } from "../lib/getTgUserId";

// const AUTH_STORAGE_KEY = "auth";

// export async function authDev(): Promise<AuthResponse> {
//   const body = {
//     telegram_id: 0,
//     username: "teamfinder",
//     first_name: "Team",
//     last_name: "Finder",
//     avatar_url:
//       "https://storage.yandexcloud.net/teamfinder-hackathons-images/hackathons/1/cover.jpg",
//   };

//   const response = await apiClient.post<AuthResponse>("/auth/dev-login", body);
//   const data = response.data;
//   saveAuthToStorage(data);
//   return data;
// }

// export async function authTelegram(): Promise<AuthResponse> {
//   const initDataRaw = resolveInitDataRaw();
//   // console.log("initDataRaw in authTelegram:", initDataRaw);

//   if (!initDataRaw) {
//     throw new Error("No init_data for tgAuth");
//   }

//   const { data } = await apiClient.post<AuthResponse>("/auth/telegram", {
//     init_data: initDataRaw,
//   });

//   saveAuthToStorage(data);
//   return data;
// }

// function saveAccessToken(token: string) {
//   apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
// }

// function saveAuthToStorage(data: AuthResponse) {
//   const token = data.access_token;
//   localStorage.setItem(AUTH_STORAGE_KEY, token);
//   saveAccessToken(token);
// }

// function restoreTokenFromStorage(): string | null {
//   const token = localStorage.getItem(AUTH_STORAGE_KEY);
//   if (!token) return null;

//   saveAccessToken(token);
//   return token;
// }

// async function fetchProfile(): Promise<AuthResponse["profile"]> {
//   const { data } = await apiClient.get<AuthResponse["profile"]>("/users/me");
//   return data;
// }

// function clearAuthStorage() {
//   localStorage.removeItem(AUTH_STORAGE_KEY);
//   delete apiClient.defaults.headers.common.Authorization;
// }

// export async function authQueryFn(): Promise<AuthResponse> {
//   const forceDevLogin =
//     import.meta.env.VITE_FORCE_DEV_LOGIN === "1" || import.meta.env.DEV;

//   if (forceDevLogin) {
//     return authDev();
//   }

//   const initDataRaw = getInitDataRaw();
//   if (!initDataRaw) return;
//   const tgUserId = getTgUserId(initDataRaw);
//   if (tgUserId) {
//     const token = restoreTokenFromStorage();

//     if (token) {
//       try {
//         const profile = await fetchProfile();
//         return {
//           access_token: token,
//           profile,
//         };
//       } catch (err: unknown) {
//         if (axios.isAxiosError(err)) {
//           const status = err.response?.status;
//           if (status === 401 || status === 403 || status === 404) {
//             clearAuthStorage();
//           } else {
//             throw err;
//           }
//         } else {
//           throw err;
//         }
//       }
//     }
//   }
//   return authTelegram();
// }
import { apiClient } from "@/shared/api/client";
import { AuthResponse } from "../model/types";
import axios from "axios";
import { resolveInitDataRaw } from "@/shared/resolveInitDataRaw";
import { getTgUserId } from "../lib/getTgUserId";

const AUTH_STORAGE_PREFIX = "tf:auth_token:";

function tokenKey(tgUserId: number) {
  return `${AUTH_STORAGE_PREFIX}${tgUserId}`;
}

function saveAccessToken(token: string) {
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
}

function saveAuthToStorage(data: AuthResponse, tgUserId: number) {
  const token = data.access_token;
  localStorage.setItem(tokenKey(tgUserId), token);
  saveAccessToken(token);
}

function restoreTokenFromStorage(tgUserId: number): string | null {
  const token = localStorage.getItem(tokenKey(tgUserId));
  if (!token) return null;
  saveAccessToken(token);
  return token;
}

function clearAuthStorage(tgUserId: number) {
  localStorage.removeItem(tokenKey(tgUserId));
  delete apiClient.defaults.headers.common.Authorization;
}

async function fetchProfile(): Promise<AuthResponse["profile"]> {
  const { data } = await apiClient.get<AuthResponse["profile"]>("/users/me");
  return data;
}

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

  // dev-акк тоже кладём в отдельный ключ (tgUserId = 0)
  saveAuthToStorage(data, 0);

  return data;
}

export async function authTelegram(): Promise<AuthResponse> {
  const initDataRaw = resolveInitDataRaw();
  if (!initDataRaw) throw new Error("No init_data for tgAuth");

  const tgUserId = getTgUserId(initDataRaw);
  if (!tgUserId) throw new Error("Cannot parse tg user id from init_data");

  const { data } = await apiClient.post<AuthResponse>("/auth/telegram", {
    init_data: initDataRaw,
  });

  saveAuthToStorage(data, tgUserId);
  return data;
}

export async function authQueryFn(): Promise<AuthResponse> {
  const forceDevLogin =
    import.meta.env.VITE_FORCE_DEV_LOGIN === "1" || import.meta.env.DEV;

  if (forceDevLogin) return authDev();

  const initDataRaw = resolveInitDataRaw();
  if (!initDataRaw) throw new Error("No init_data for tgAuth");

  const tgUserId = getTgUserId(initDataRaw);
  if (!tgUserId) throw new Error("Cannot parse tg user id from init_data");

  const token = restoreTokenFromStorage(tgUserId);
  if (token) {
    try {
      const profile = await fetchProfile();
      return { access_token: token, profile };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401 || status === 403 || status === 404) {
          clearAuthStorage(tgUserId);
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
  }

  return authTelegram();
}
