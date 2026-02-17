# TeamFinder

Telegram Mini App для хакатонов, которая помогает участникам находить команды и тиммейтов: создавать команды, публиковать вакансии, откликаться, отправлять инвайты и фиксировать достижения.

В репозитории несколько сервисов:

- **frontend** — React/Vite SPA (Mini App UI), см. `frontend/README.md`
- **backend** — FastAPI API + Postgres + S3, см. секцию ниже и `backend/README.md`
- **admin_bot** — админ‑бот на Aiogram для управления хакатонами (`/admin_bot`)
- **postgres** — Docker‑образ базы данных (инициализация в `postgres/initdb_db`)
- **infra/nginx** — nginx‑конфиг для продакшена (SSL + reverse‑proxy)

---

## Локальный запуск через Docker Compose

Проще всего поднять все сервисы локально через `docker-compose.yml`.

Требования:

- Docker и Docker Compose
- файл `.env` в корне (можно скопировать из `env.example` и при необходимости переименовать в `.env`)

Запуск:

```bash
cp env.example .env   # при первом старте
docker compose up --build
```

После старта (зависит от конфигурации `docker-compose.yml`):

- **Frontend**: обычно `http://localhost` или `http://localhost:<порт>`
- **Backend API**: `http://localhost:<порт>/api`

---

## Локальная разработка

### Backend

Подробный README лежит в `backend/README.md`. Кратко:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# .env — можно использовать те же переменные, что и в корневом .env
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API:

- без прокси: `http://localhost:8000` (`/system/health`, `/auth/*`, `/hackathons/*` и т.д.)
- с прокси: используется `root_path="/api"` (см. `presentations/app.py`)

### Frontend

```bash
cd frontend
npm install

# Dev без HTTPS
npm run dev

# Dev с HTTPS (удобно для интеграции с Telegram Mini Apps)
npm run dev:https
```

Фронтенд стучится в API по адресу из `VITE_API_URL`:

- для дев‑окружения обычно `http://localhost:8000/api/`
- в проде — `https://teamfinder.tech/api/` или ваш домен

Подробнее см. `frontend/README.md`.

### Admin Bot

```bash
cd admin_bot
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Требуются ADMIN_BOT_TOKEN, ADMIN_API_TOKEN, API_URL, ADMIN_TELEGRAM_IDS
python -m main
```

Бот позволяет администраторам создавать и удалять хакатоны через команды `/addhackathon` и `/deletehackathon`.

---

## Конфигурация и .env

Конфигурация централизована через переменные окружения и файл `.env` в корне. Основные блоки:

- **Backend / база**:
  - `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
  - либо `DATABASE_URL`
- **Auth / Telegram / JWT**:
  - `TELEGRAM_BOT_TOKEN`
  - `JWT_SECRET`
  - `ADMIN_API_TOKEN`
  - `TG_BOT_USERNAME`, `TG_APP_NAME`
- **S3**:
  - `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_PUBLIC_BASE_URL`
- **Frontend**:
  - `VITE_API_URL` — базовый URL API
- **Admin Bot**:
  - `ADMIN_BOT_TOKEN`, `API_URL`, `ADMIN_TELEGRAM_IDS`

Пример значений вынесен в `./.env.example` (см. его как источник правдоподобных дефолтов).

---