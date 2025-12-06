import { retrieveLaunchParams } from "@tma.js/sdk-react";

// Возвращает initDataRaw из любого доступного места: SDK, TG WebView или URL (?|#)tgWebAppData
export function resolveInitDataRaw(): string | undefined {
  // 1) SDK (retrieveLaunchParams)
  try {
    // явно описываем только то, что нам нужно
    type LaunchParamsWithRaw = { initDataRaw?: string };

    const lp = retrieveLaunchParams() as LaunchParamsWithRaw | undefined;
    const raw = lp?.initDataRaw;

    if (typeof raw === "string" && raw.length > 0) {
      return raw;
    }
  } catch (error) {
    console.warn(
      "[resolveInitDataRaw] Failed to get initDataRaw from SDK launch params",
      error
    );
  }

  // В не-браузерной среде (SSR/tests) дальше window трогать нельзя
  if (typeof window === "undefined") {
    console.warn("[resolveInitDataRaw] window is undefined (non-browser env)");
    return undefined;
  }

  // 2) Прямо из Telegram WebView
  const fromTG = window.Telegram?.WebApp?.initData;
  if (typeof fromTG === "string" && fromTG.length > 0) {
    return fromTG;
  }

  // 3) Если Telegram открыл ВНЕШНИМ браузером — он прокидывает tgWebAppData в URL
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const search = new URLSearchParams(window.location.search);
  const viaParam = hash.get("tgWebAppData") ?? search.get("tgWebAppData");

  if (viaParam) {
    try {
      // это уже url-encoded querystring
      return decodeURIComponent(viaParam);
    } catch (error) {
      console.warn(
        "[resolveInitDataRaw] Failed to decode tgWebAppData from URL",
        error
      );
    }
  }

  // 4) Ничего не нашли
  return undefined;
}
