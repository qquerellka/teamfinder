import { useLaunchParams } from '@tma.js/sdk-react';

const APPLE_PLATFORMS = new Set(['ios', 'macos']);

export function useIsApplePlatform(): boolean {
  const lp = useLaunchParams();

  const platform = lp?.tgWebAppPlatform;

  if (!platform) {
    return false;
  }

  return APPLE_PLATFORMS.has(platform);
}
