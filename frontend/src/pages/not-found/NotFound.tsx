import { ButtonsSection } from '@/shared/ui';
import { CodeBlock } from '@/shared/ui/Code';
import { Button, LargeTitle, Text } from '@telegram-apps/telegram-ui';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  const errorCode = `
# Всем привет!
'''
Я, страница, ушла на хакатон.
Мне нужно было срочно в команду.
Не теряй время зря - делай как я!
'''
while True:
    sleep()
    go_to_hackathon()
    win()
`;
  return (
    <Container>
      <CodeBlock code={errorCode} />

      <ButtonsSection>
        <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column' }}>
          <LargeTitle weight="2" plain={true}>
            404
          </LargeTitle>
          <Text>Страница не найдена</Text>
        </div>

        <Button size="m" onClick={() => navigate('/')}>
          На главную
        </Button>
        <Button mode="bezeled" size="m" onClick={() => navigate(-1)}>
          Назад
        </Button>
      </ButtonsSection>
    </Container>
  );
};

export default NotFoundPage;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: var(--tg-theme-bg-color);
`;
