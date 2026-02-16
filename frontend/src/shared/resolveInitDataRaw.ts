import { getInitDataRaw } from './initDataStore';
import { retrieveLaunchParams } from '@tma.js/sdk-react';

export function resolveInitDataRaw(): string | undefined {
  const cached = getInitDataRaw();
  if (cached) return cached;

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

  if (typeof window !== 'undefined') {

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

  return undefined;
}
