import { FC, ReactNode } from "react";
import styled from "styled-components";
import { SText } from "./SText";
import { List } from "@telegram-apps/telegram-ui";

interface InpurSectionProps {
  children: ReactNode;
  header?: string;
}

export const InputSection: FC<InpurSectionProps> = ({ children, header }) => {
  return (
    <Wrapper>
      {header && (
        <Header>
          <SText $fw={600} $fs={16}>
            {header}
          </SText>
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
  width: 100%;
  background-color: var(--tg-theme-secondary-bg-color);
  padding: 0;
  & > div {
    padding: 0;
  }
  & > div {
    display: flex;
    width: 100%;
    background-color: var(--tg-theme-secondary-bg-color);
  }

  & > div > * {
    flex: 1;
    min-width: 0;
  }
`;