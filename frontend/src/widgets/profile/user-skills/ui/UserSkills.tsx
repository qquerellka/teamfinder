import { Textarea } from '@telegram-apps/telegram-ui';
import { InputSection } from '@/shared/ui';

export const UserBio = ({ bio }: { bio: string }) => (
  <InputSection header="Обо мне">
    <Textarea value={bio} disabled />
  </InputSection>
);
