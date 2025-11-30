import { HashRouter } from "react-router-dom";
import { useLaunchParams, useSignal, miniApp } from "@tma.js/sdk-react";
import { AppRoot } from "@telegram-apps/telegram-ui";
import { ReactQueryProvider } from "./providers/react-query";

import { ErrorBoundary } from "./layouts/ErrorBoundary";
import { AppRouter } from "./routing/routes";
import { useEffect } from "react";
import { AuthGate } from "@/features/auth/ui/AuthGate";

function ErrorBoundaryError({ error }: { error: unknown }) {
  return (
    <div>
      <p>An unhandled error occurred:</p>
      <blockquote>
        <code>
          {error instanceof Error
            ? error.message
            : typeof error === "string"
            ? error
            : JSON.stringify(error)}
        </code>
      </blockquote>
    </div>
  );
}
interface AppProps {
  str: string | undefined;
}
export function App({ str }: AppProps) {
  const lp = useLaunchParams();

  const isDark = useSignal(miniApp.isDark);
  useEffect(() => {
    console.log("[App] initDataRaw:", lp.initDataRaw);
    // console.log("[App] user:", lp.initData?.user);
  }, [lp]);
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <AppRoot
        appearance={isDark ? "dark" : "light"}
        platform={
          ["macos", "ios"].includes(lp.tgWebAppPlatform) ? "ios" : "base"
        }
      >
        {""}
        {str}
        <ReactQueryProvider>
          <AuthGate>
            <HashRouter>
              <AppRouter />
            </HashRouter>
          </AuthGate>
        </ReactQueryProvider>
      </AppRoot>
    </ErrorBoundary>
  );
}
