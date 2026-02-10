import { postEvent } from '@tma.js/sdk-react';

export async function haptic() {
  try {
    postEvent('web_app_trigger_haptic_feedback', {
      type: 'impact',
      impact_style: 'light',
    });
  } catch (error) {
    console.debug('Haptic feedback not available', error);
  }
}

// export const useTelegramHaptic = () => {
//   const impact = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
//     const tg = window.Telegram?.WebApp;

//     if (tg?.HapticFeedback?.impactOccurred) {
//       try {
//         tg.HapticFeedback.impactOccurred(style);
//       } catch (error) {
//         console.debug('Haptic feedback not available', error);
//       }
//     }
//   };

//   // Можно добавить другие методы позже
//   const notify = (type: 'error' | 'success' | 'warning') => {
//     const tg = window.Telegram?.WebApp;
//     if (tg?.HapticFeedback?.notificationOccurred) {
//       try {
//         tg.HapticFeedback.notificationOccurred(type);
//       } catch (error) {
//         console.debug('Haptic notification not available', error);
//       }
//     }
//   };

//   const selectionChange = () => {
//     const tg = window.Telegram?.WebApp;
//     if (tg?.HapticFeedback?.selectionChanged) {
//       try {
//         tg.HapticFeedback.selectionChanged();
//       } catch (error) {
//         console.debug('Haptic selection change not available', error);
//       }
//     }
//   };

//   return { impact, notify, selectionChange };
// };
