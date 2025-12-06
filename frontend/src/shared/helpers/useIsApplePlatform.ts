import { useLaunchParams } from "@tma.js/sdk-react";

const APPLE_PLATFORMS = new Set<ReturnType<typeof lp>["tgWebAppPlatform"]>([
  "ios",
  "macos",
]);

export function useIsApplePlatform(): boolean {
  const lp = useLaunchParams();

  const platform = lp?.tgWebAppPlatform;
  // на всякий случай залогировать
  // console.log("[platform]", platform);

  if (!platform) {
    return false;
  }

  return APPLE_PLATFORMS.has(platform);
}
