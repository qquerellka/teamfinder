import { ButtonsSection, SText } from '@/shared/ui';
import { CodeBlock } from '@/shared/ui/Code';
import { Button, Placeholder } from '@telegram-apps/telegram-ui';
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
        <div style={{marginBottom: 16, display: 'flex', flexDirection: 'column'}}>
          <SText $fs={60} $fw={500}>
            404
          </SText>
          <SText>Страница не найдена</SText>
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

// const ButtonGroup = styled.div`
//   display: flex;
//   gap: 0.5rem;
//   flex-wrap: wrap;
//   justify-content: center;
//   margin: 1.5rem 0;
// `;
