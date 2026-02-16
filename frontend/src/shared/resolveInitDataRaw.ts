import { getInitDataRaw } from './initDataStore';
import { retrieveLaunchParams } from '@tma.js/sdk-react';

export function resolveInitDataRaw(): string | undefined {
  // 0) Сначала — то, что закешировано при bootstrapTMA
  const cached = getInitDataRaw();
  if (cached) return cached;
  // const tgInitData = window?.Telegram?.WebApp?.initData;
  // if (typeof tgInitData === 'string' && tgInitData.length > 0) return tgInitData;

  // 1) Попытка через SDK (если вдруг вызвали до bootstrapTMA или вне TMA-окружения)
  try {
    const lp = retrieveLaunchParams() as {
      initDataRaw?: string;
      initData?: string;
    };
    if (lp.initDataRaw) return lp.initDataRaw;
    if (lp.initData) return lp.initData;
  } catch (error) {
    console.warn('[resolveInitDataRaw] retrieveLaunchParams failed', error);
  }

  // 2) Попытка из Telegram WebView (на случай, если SDK не отдал)
  if (typeof window !== 'undefined') {
    // const fromTG = window.Telegram?.WebApp?.initData;
    // if (typeof fromTG === 'string' && fromTG.length > 0) {
    //   return fromTG;
    // }

    const hash = new URLSearchParams(window.location.hash.slice(1));
    const search = new URLSearchParams(window.location.search);
    const viaParam = hash.get('tgWebAppData') ?? search.get('tgWebAppData');

    if (viaParam) {
      try {
        return decodeURIComponent(viaParam);
      } catch (error) {
        console.warn('[resolveInitDataRaw] Failed decode tgWebAppData', error);
      }
    }
  }

  // 3) Ничего не нашли
  return undefined;
}
