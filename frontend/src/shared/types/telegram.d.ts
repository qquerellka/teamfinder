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

declare global {
  interface TelegramWebApp {
    HapticFeedback: {
      impactOccurred: (
        style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
      ) => void;
      notificationOccurred: (
        type: 'error' | 'success' | 'warning'
      ) => void;
      selectionChanged: () => void;
    };
    // ... другие свойства если нужно
    ready: () => void;
    expand: () => void;
    close: () => void;
  }

  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export {}; // Это нужно для модуля