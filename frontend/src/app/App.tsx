import { HashRouter, useLocation } from 'react-router-dom';
import { useLaunchParams, useSignal, miniApp } from '@tma.js/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { ReactQueryProvider } from './providers/react-query';

import { ErrorBoundary } from './layouts/ErrorBoundary';
import { AppErrorFallback } from './layouts/AppErrorFallback';
import { AppRouter } from './routing/routes';
import { AuthGate } from '@/features/auth';
import { LoaderPage } from '@/shared/ui';
import { Suspense } from 'react';

import { QueryErrorResetBoundary, useQueryClient } from '@tanstack/react-query';
import { StartParamJoinHandler } from '../features/team/join';

function AppInner() {
  const location = useLocation();
  const queryClient = useQueryClient();

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallback={AppErrorFallback}
          resetKeys={[location.key]}
          onReset={() => {
            reset();
            queryClient.invalidateQueries({
              predicate: q => q.queryKey[0] !== 'auth',
            });
          }}
        >
          <Suspense fallback={<LoaderPage />}>
            <AuthGate>
              <StartParamJoinHandler />
              <AppRouter />
            </AuthGate>
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  const platform =
    lp.tgWebAppPlatform === 'ios' || lp.tgWebAppPlatform === 'macos' ? 'ios' : 'base';

  return (
    <AppRoot appearance={isDark ? 'dark' : 'light'} platform={platform}>
      <HashRouter>
        <ReactQueryProvider>
          <AppInner />
        </ReactQueryProvider>
      </HashRouter>
    </AppRoot>
  );
}
