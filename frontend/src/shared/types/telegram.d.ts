export {};

declare global {
  interface TelegramWebAppOpenLinkOptions {
    try_instant_view?: boolean;
  }

  interface TelegramWebApp {
    initData?: string;
    initDataUnsafe?: unknown;

    openLink?(url: string, options?: TelegramWebAppOpenLinkOptions): void;
    // если используешь другие методы WebApp — тоже добавь сюда
  }

  interface TelegramNamespace {
    WebApp?: TelegramWebApp;
  }

  interface Window {
    Telegram?: TelegramNamespace;
  }
}
