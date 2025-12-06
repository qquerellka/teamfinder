import { HashRouter } from "react-router-dom";
import { useLaunchParams, useSignal, miniApp } from "@tma.js/sdk-react";
import { AppRoot } from "@telegram-apps/telegram-ui";
import { ReactQueryProvider } from "./providers/react-query";

import { ErrorBoundary } from "./layouts/ErrorBoundary";
import { AppErrorFallback } from "./layouts/AppErrorFallback";
import { AppRouter } from "./routing/routes";
import { AuthGate } from "@/features/auth/ui/AuthGate";

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  const platform =
    lp.tgWebAppPlatform === "ios" || lp.tgWebAppPlatform === "macos"
      ? "ios"
      : "base";

  return (
    <AppRoot appearance={isDark ? "dark" : "light"} platform={platform}>
      <ReactQueryProvider>
        <ErrorBoundary fallback={AppErrorFallback}>
          <AuthGate>
            <HashRouter>
              <AppRouter />
            </HashRouter>
          </AuthGate>
        </ErrorBoundary>
      </ReactQueryProvider>
    </AppRoot>
  );
}
