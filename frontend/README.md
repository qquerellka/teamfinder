# TeamFinder Frontend

Фронтенд‑часть проекта TeamFinder — одностраничное приложение для Telegram Mini Apps, написанное на **React + TypeScript** и собираемое через **Vite**.

Приложение может работать:

- внутри Telegram как Mini App;
- в браузере (dev‑режим) с моканным Telegram‑окружением.

---

## Стек

- **React 18**
- **TypeScript**
- **Vite**
- **@tma.js/sdk-react**, **@telegram-apps/telegram-ui** — интеграция с Telegram Mini Apps и UI‑компоненты
- **@tanstack/react-query** — работа с API и кешированием запросов
- **zustand** — состояние клиента
- **styled-components** — стилизация компонентов
- **axios** — HTTP‑клиент (`src/shared/api/client.ts`)

---

## Переменные окружения

Основная переменная для фронтенда:

- `VITE_API_URL` — базовый URL backend API.

Использование:

```ts
// src/shared/api/client.ts
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://teamfinder.tech/api/',
  withCredentials: false,
});
```

Рекомендуемые значения:

- локально: `VITE_API_URL=http://localhost:8000/api/`
- прод: `VITE_API_URL=https://teamfinder.tech/api/` (или ваш домен)

Переменные можно задать:

- в корневом `.env` (при запуске через Docker);
- через `frontend/.env.local` или `frontend/.env` при локальной разработке.

---

## Установка и команды

```bash
cd frontend
npm install
```

Доступные скрипты (`package.json`):

- `npm run dev` — dev‑сервер Vite без HTTPS.
- `npm run dev:https` — dev‑сервер с локальными SSL‑сертификатами (через `vite-plugin-mkcert`).
- `npm run build` — сборка production‑версии в `dist/`.
- `npm run preview` — локальный просмотр собранной версии.
- `npm run lint` / `npm run lint:fix` — ESLint.
- `npm run format` / `npm run format:check` — Prettier.
- `npm run deploy` — деплой на GitHub Pages (опционально).

---

## Запуск в режиме разработки

### Вариант 1. Обычный dev‑режим (HTTP)

Подходит для быстрой разработки в браузере.

```bash
VITE_API_URL=http://localhost:8000/api/ npm run dev
# по умолчанию: http://localhost:5173/
```

### Вариант 2. Dev с HTTPS (для тестирования Mini App)

Telegram Mini Apps ожидают HTTPS. Для локальной отладки можно использовать самоподписанный сертификат:

```bash
VITE_API_URL=http://localhost:8000/api/ npm run dev:https
# по умолчанию: https://localhost:5173/
```

При первом запуске `vite-plugin-mkcert` может запросить sudo‑пароль для установки сертификата.

---

## Production‑сборка

```bash
npm run build
```

Результат попадает в `frontend/dist/` и используется:

- локально — через `npm run preview`;
- в продакшене — nginx из `docker-compose.prod.yaml` раздаёт собранную статику.

---

## Структура фронтенда

Упрощённо:

```text
frontend/
  src/
    app/          # инициализация приложения, маршрутизация, layout
    pages/        # страницы (HackathonsPage, TeamsPage, ProfilePage и т.д.)
    widgets/      # крупные UI‑блоки (списки, карточки и т.п.)
    features/     # функциональные модули (создание команды, вакансии, заявки и т.д.)
    entities/     # доменные сущности (User, Team, Hackathon, Vacancy, Application...)
    shared/       # переиспользуемые компоненты, API‑клиент, хуки, утилиты
  public/         # статические файлы
  vite.config.ts  # конфигурация Vite
  package.json
```

Основной вход в приложение — `src/app/App.tsx`, API‑клиент — `src/shared/api/client.ts`.

---

## Интеграция с Telegram Mini Apps

Для запуска приложения внутри Telegram:

1. Создайте бота через `@BotFather`.
2. В настройках Mini App укажите прод‑URL фронтенда (например, `https://teamfinder.tech`).
3. Настройте backend (`TG_BOT_USERNAME`, `TG_APP_NAME`), чтобы корректно генерировались deep‑link’и.

В dev‑режиме часть Telegram‑окружения может мокаться (см. `src/mockEnv.ts`, если используется в проекте), чтобы приложение корректно работало в браузере без Telegram‑клиента.

