FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# системные пакеты по минимуму (при необходимости докинешь сюда libc, tzdata и т.п.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# зависимости бота
COPY admin_bot/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# код бота
COPY admin_bot ./admin_bot

CMD ["python", "-m", "admin_bot.main"]
