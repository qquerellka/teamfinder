import { FC, ReactNode } from 'react';
import styled from 'styled-components';
import { List, Text } from '@telegram-apps/telegram-ui';

interface InpurSectionProps {
  children: ReactNode;
  header?: string;
}

export const InputSection: FC<InpurSectionProps> = ({ children, header }) => {
  return (
    <Wrapper>
      {header && (
        <Header>
          <Text weight="2">{header}</Text>
        </Header>
      )}

      <Main>{children}</Main>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
`;

const Header = styled.div`
  padding: 0px 4px 0.5rem 0px;
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  color: var(--tg-theme-accent-text-color);
`;

const Main = styled(List)`
  display: flex;
  flex-direction: column;
  width: 100%;

  border-radius: 1rem;
  background-color: var(--tg-theme-secondary-bg-color);
  padding: 0;
  & > div {
    border-radius: 1rem;
    padding: 0;
  }
  & > div {
    display: flex;
    width: 100%;
    border-radius: 1rem;
    background-color: var(--tg-theme-secondary-bg-color);
  }

  & > div > * {
    flex: 1;
    border-radius: 1rem;
    min-width: 0;
  }
`;
