import { postEvent } from '@tma.js/sdk-react';

export function haptic() {
  try {
    postEvent('web_app_trigger_haptic_feedback', {
      type: 'impact',
      impact_style: 'light',
    });
  } catch (error) {
    console.debug('Haptic feedback not available', error);
  }
}