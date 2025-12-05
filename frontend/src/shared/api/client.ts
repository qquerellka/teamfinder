// src/shared/api/client.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "https://teamfinder.tech/api/",
  withCredentials: false,
});
