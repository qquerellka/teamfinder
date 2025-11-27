// Возвращает initDataRaw из любого доступного места: SDK, TG WebView или URL (?|#)tgWebAppData
export function resolveInitDataRaw(): string | undefined {
  // 1) SDK (retrieveLaunchParams)
  try {
    const { retrieveLaunchParams } = require("@tma.js/sdk-react");
    const lp = retrieveLaunchParams();
    if (lp?.initDataRaw) return lp.initDataRaw;
  } catch {}

  // 2) Прямо из Telegram WebView
  const fromTG = (window as any)?.Telegram?.WebApp?.initData;
  if (fromTG) return fromTG as string;

  // 3) Если Telegram открыл ВНЕШНИМ браузером — он прокидывает tgWebAppData в URL
  const hash = new URLSearchParams(location.hash.slice(1));
  const search = new URLSearchParams(location.search);
  const viaParam = hash.get("tgWebAppData") || search.get("tgWebAppData");
  if (viaParam) return decodeURIComponent(viaParam); // это уже url-encoded querystring

  // 4) Ничего не нашли
  return undefined;
}
