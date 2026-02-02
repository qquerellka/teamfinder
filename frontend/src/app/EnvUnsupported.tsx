import { Placeholder, AppRoot, Button } from '@telegram-apps/telegram-ui';
import { retrieveLaunchParams, isColorDark, isRGB } from '@tma.js/sdk-react';
import { useEffect, useMemo, useState } from 'react';

export function EnvUnsupported() {
  const [platform, isDark] = useMemo(() => {
    try {
      const lp = retrieveLaunchParams();
      const { bg_color: bgColor } = lp.tgWebAppThemeParams;
      return [lp.tgWebAppPlatform, bgColor && isRGB(bgColor) ? isColorDark(bgColor) : false];
    } catch {
      return ['android', false];
    }
  }, []);

  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Обратный отсчет
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = 'https://t.me/teamfinder_hack_bot/hackathons';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(platform) ? 'ios' : 'base'}
    >
      <Placeholder
        header="Требуется обновление"
        description={`Ваша версия Telegram устарела. Через ${countdown} секунд вы будете перенаправлены в бот...`}
      >
        <img
          alt="Telegram sticker"
          src="https://xelene.me/telegram.gif"
          style={{ display: 'block', width: '144px', height: '144px', marginBottom: '20px' }}
        />
        <Button
          size="m"
          stretched
          onClick={() => {
            window.location.href = 'https://t.me/teamfinder_hack_bot/hackathons';
          }}
        >
          Перейти сейчас
        </Button>
      </Placeholder>
    </AppRoot>
  );
}
