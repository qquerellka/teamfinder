export {};

declare global {
  interface TelegramWebApp {
    initData?: string;
    initDataUnsafe?: unknown;
  }

  interface TelegramNamespace {
    WebApp?: TelegramWebApp;
  }

  interface Window {
    Telegram?: TelegramNamespace;
  }
}
