import { Placeholder, AppRoot } from '@telegram-apps/telegram-ui';
import { retrieveLaunchParams, isColorDark, isRGB } from '@tma.js/sdk-react';
import { useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';

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

  // const navigate = useNavigate();
  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(platform) ? 'ios' : 'base'}
    >
      <Placeholder
        header="Oops"
        description="You are using too old Telegram client to run this application"
      >
        <img
          alt="Telegram sticker"
          src="https://xelene.me/telegram.gif"
          style={{ display: 'block', width: '144px', height: '144px' }}
        />
        {/* <Button onClick={() => navigate('https://t.me/teamfinder_hack_bot/')}>Перейти в приложение</Button> */}
      </Placeholder>
    </AppRoot>
  );
}
