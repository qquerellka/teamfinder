import { Navigate, Route, Routes, HashRouter } from "react-router-dom";
import { useLaunchParams, useSignal, miniApp } from "@tma.js/sdk-react";
import { AppRoot } from "@telegram-apps/telegram-ui";

import { routes } from "@/app/routes";
import RootLayout from "./Layout";
import { ErrorBoundary } from "./ErrorBoundary";

function ErrorBoundaryError({ error }: { error: unknown }) {
  return (
    <div>
      <p>An unhandled error occurred:</p>
      <blockquote>
        <code>
          {error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : JSON.stringify(error)}
        </code>
      </blockquote>
    </div>
  );
}

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <AppRoot
        appearance={isDark ? "dark" : "light"}
        platform={
          ["macos", "ios"].includes(lp.tgWebAppPlatform) ? "ios" : "base"
        }
      >
        <HashRouter>
          <Routes>
            <Route element={<RootLayout />}>
              {routes.map((r) => (
                <Route key={r.path} {...r} />
              ))}
            </Route>{" "}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </HashRouter>
      </AppRoot>
    </ErrorBoundary>
  );
}
