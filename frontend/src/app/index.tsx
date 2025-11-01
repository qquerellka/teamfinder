import '@telegram-apps/telegram-ui/dist/styles.css';
import './styles/index.css';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { retrieveLaunchParams } from '@tma.js/sdk-react';

import { EnvUnsupported } from '@/app/EnvUnsupported.tsx';
import { init } from '@/app/init.ts';

// Mock the environment in case, we are outside Telegram.
import './mocks/mockEnv.ts';
import { App } from './App.tsx';

const root = ReactDOM.createRoot(document.getElementById('root')!);

try {
  const launchParams = retrieveLaunchParams();
  const { tgWebAppPlatform: platform } = launchParams;
  const debug = (launchParams.tgWebAppStartParam || '').includes('debug')
    || import.meta.env.DEV;

  // Configure all application dependencies.
  await init({
    debug,
    eruda: debug && ['ios', 'android'].includes(platform),
    mockForMacOS: platform === 'macos',
  })
    .then(() => {
      root.render(
        <StrictMode>
          <App/>
        </StrictMode>,
      );
    });
} catch (e) {
  root.render(<EnvUnsupported/>);
}
