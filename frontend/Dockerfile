# --- Stage 1: build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Устанавливаем зависимости
# Если используешь npm (а у тебя есть package-lock.json) — этого достаточно
COPY package*.json ./
RUN npm ci

# Копируем остальной проект и собираем
COPY . .
RUN npm run build

# --- Stage 2: serve with nginx ---
FROM nginx:1.27-alpine

# Удаляем дефолтный конфиг и кладём свой
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Кладём собранный фронт
COPY --from=builder /app/dist /usr/share/nginx/html/teamfinder

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
