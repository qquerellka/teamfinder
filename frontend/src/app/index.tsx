import '@telegram-apps/telegram-ui/dist/styles.css';
import './styles/index.css';
import './styles/reset.css';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { retrieveLaunchParams, retrieveRawInitData } from '@tma.js/sdk-react';

import { init } from '@/app/init';
import { App } from './App';
import { EnvUnsupported } from '@/app/EnvUnsupported';
import { setInitDataRaw } from '@/shared/initDataStore';

function loadUmamiAnalytics() {
  if (import.meta.env.PROD) {
    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://cloud.umami.is/script.js';
    script.setAttribute('data-website-id', 'fd2a58b1-bd8f-4a06-8d93-7ff983757e42');
  } else {
    console.log('Development mode - Umami analytics disabled');
  }
}

const FORCE_BROWSER = import.meta.env.VITE_FORCE_BROWSER === 'true';

// не во всех браузерах поддерживается
if (import.meta.env.DEV || FORCE_BROWSER) {
  await import('./mocks/mockEnv');
}

const root = ReactDOM.createRoot(document.getElementById('root')!);

async function bootstrapBrowser() {
  const debug = true;

  await init({
    debug,
    eruda: false,
    mockForMacOS: true,
  });

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

async function bootstrapTMA() {
  const lp = retrieveLaunchParams();
  const initDataRaww = retrieveRawInitData();
  console.log(initDataRaww);
  const a =
    new URLSearchParams(location.hash.slice(1)).get('tgWebAppData') ||
    new URLSearchParams(location.search).get('tgWebAppData');

  const initDataRaw: string | undefined =
    // lp.initDataRaw ??
    // lp.initData ??
    a ? decodeURIComponent(a) : undefined;

  setInitDataRaw(initDataRaw);

  const debug = (lp.tgWebAppStartParam || '').includes('debug') || import.meta.env.DEV;

  await init({
    debug,
    eruda: debug && ['ios', 'android'].includes(lp.tgWebAppPlatform || ''),
    mockForMacOS: false,
  });

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

(async () => {
  try {
    loadUmamiAnalytics();

    if (FORCE_BROWSER || import.meta.env.DEV) {
      await bootstrapBrowser();
    } else {
      await bootstrapTMA();
    }
  } catch (e) {
    console.error(e);
    root.render(<EnvUnsupported />);
  }
})();
