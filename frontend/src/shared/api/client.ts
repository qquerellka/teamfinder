import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://teamfinder.tech/api/',
  withCredentials: false,
});

// Глобальная обработка 401/403:
// при невалидном / просроченном токене очищаем локальное состояние
// и принудительно перезагружаем приложение, чтобы заново пройти auth-флоу.
apiClient.interceptors.response.use(
  response => response,
  error => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      try {
        // Удаляем все сохранённые access-токены
        // (используется префикс из features/auth/api/login.ts)
        const AUTH_STORAGE_PREFIX = 'tf:auth_token:';

        try {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith(AUTH_STORAGE_PREFIX)) {
              localStorage.removeItem(key);
            }
          });
          localStorage.removeItem('tf:last_profile_id');
        } catch {
          // игнорируем ошибки доступа к localStorage
        }

        // Сбрасываем Authorization в axios по умолчанию
        try {
          delete apiClient.defaults.headers.common.Authorization;
        } catch {
          // игнорируем
        }

        // Полная перезагрузка мини-приложения.
        // Это надёжнее простого refetch, т.к. заново инициализирует initData.
        // window.location.reload();
        console.log("window")
      } catch {
        // на всякий случай просто пробрасываем ошибку
      }
    }

    return Promise.reject(error);
  },
);
