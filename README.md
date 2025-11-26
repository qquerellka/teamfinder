# Teamfinder — конспект по проекту

Краткий конспект архитектуры, стека и процессов разработки.

---

## 1. Общая идея

Teamfinder — платформа для поиска команд и участников хакатонов:

- Telegram Mini App (фронтенд внутри Telegram).
- Backend на FastAPI + PostgreSQL.
- Обмен по REST API, авторизация через JWT (и/или Telegram WebApp init data).

---

## 2. Архитектура фронтенда

**Технологии:**

- React + TypeScript
- Vite
- React Router
- React Query (`@tanstack/react-query`)
- Zustand
- `@telegram-apps/telegram-ui`
- `styled-components`
- axios (`apiClient`)

**Подход: Feature-Sliced Design (FSD)**

Структура (упрощённо):

```text
frontend/
  src/
    app/        # корневое приложение, провайдеры, роутер
    pages/      # страницы (HackathonsPage, HackathonPage, ProfilePage, ...)
    widgets/    # крупные блоки UI (списки, панели)
    features/   # фичи (create-team, manage-vacancy, auth-telegram, ...)
    entities/   # доменные сущности (hackathon, team, user, vacancy, invite)
    shared/     # общий код (apiClient, ui-kit, helpers, config, types)
```

**Основные идеи:**

- `entities/*`:
  - типы доменных моделей (`Hackathon`, `Team`, `User`, ...);
  - API-клиенты (`/api`) для бекенда;
  - UI-компоненты (`HackathonCard` и т.п.).
- `features/*`:
  - бизнес-логика действий пользователя (создание команды, отклик, приглашение).
- `widgets/*`:
  - композиция нескольких `entities` + `features` в готовые блоки.
- `app/`:
  - подключение React Query, Zustand;
  - настройка роутинга;
  - глобальные стили и тема UI.

**Работа с API:**

- `apiClient` (axios) в `shared/api/client`:
  - базовый URL (настройка через `VITE_API_URL`);
  - интерсепторы для токена;
- маппинг ответов бекенда:
  - DTO в `snake_case` → доменные модели в `camelCase`;
  - строки дат → `Date`.

---

## 3. Архитектура бэкенда

**Технологии:**

- Python 3.12+
- FastAPI
- PostgreSQL
- SQLAlchemy async (2.x) + `asyncpg`
- Pydantic v2 + `pydantic-settings`
- Uvicorn
- Docker / Docker Compose

**Слои:**

```text
backend/
  main.py               # точка входа FastAPI
  settings/             # конфиг сервиса (Pydantic Settings)
  infrastructure/       # база, s3, внешние интеграции
  persistend/models/    # модели БД (SQLAlchemy)
  repositories/         # репозитории (CRUD и запросы)
  services/             # бизнес-логика
  presentations/api/    # HTTP-роутеры FastAPI
```

**Описание слоёв:**

- `presentations/api`:
  - FastAPI-роутеры (`APIRouter`);
  - сериализация/десериализация через Pydantic-схемы;
  - HTTP-ошибки, статус-коды.
- `services`:
  - бизнес-операции (создать команду, создать вакансию, отклик, инвайт);
  - валидация правил (кто что может делать);
  - координация работы нескольких репозиториев.
- `repositories`:
  - инкапсулируют доступ к БД;
  - простые CRUD и специализированные запросы.
- `persistend/models`:
  - декларативные модели SQLAlchemy;
  - связи `ForeignKey`, индексы, `created_at` / `updated_at`.
- `infrastructure`:
  - инициализация `AsyncSession` для SQLAlchemy;
  - S3/Yandex Object Storage клиент (для картинок);
  - дополнительные адаптеры под внешние сервисы.
- `settings`:
  - загрузка конфигурации из `.env` (БД, JWT, S3, CORS, окружение).

---

## 4. Стек и инфраструктура

**Frontend:**

- React + TS
- Vite
- React Query
- Zustand
- `@telegram-apps/telegram-ui`
- `styled-components`
- axios

**Backend:**

- Python + FastAPI
- SQLAlchemy async
- PostgreSQL
- asyncpg
- Pydantic / Pydantic Settings
- Uvicorn

**Infra / DevOps:**

- Docker, Docker Compose
- GitHub Actions:
  - `ci.yml` — линт + сборка фронта, компиляция питона;
  - `deploy-frontend.yml` — деплой фронта на GitHub Pages.
- Git Flow:
  - `main` — прод/стейбл;
  - `develop` — основная разработка;
  - `feature/*` — ветки фич.

---

## 5. Git Flow и правила

- `main` — стабильная ветка: деплой и прод.
- `develop` — основная ветка разработки.
- `feature/*` — ветка под конкретную задачу/фичу.

Ограничения:

- `main` и `develop` защищены:
  - нельзя удалить;
  - нельзя `force push`;
  - изменения только через Pull Request.
- merge-стратегия — **Squash merge**:
  - каждый PR превращается в один коммит;
  - история остаётся линейной и читаемой.
