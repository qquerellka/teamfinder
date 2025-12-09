import { FC, ReactNode } from "react";
import styled from "styled-components";
import { STitle } from "./STitle";
import { List } from "@telegram-apps/telegram-ui";

interface InpurSectionProps {
  children: ReactNode;
  header?: string;
}

export const InputSection: FC<InpurSectionProps> = ({ children, header }) => {
  return (
    <Wrapper>
      <Header>
        <STitle $fw={600} $fs={16}>
          {header}
        </STitle>
      </Header>
      <Main>{children}</Main>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
`;

const Header = styled.div`
  padding: 20px 24px 4px 22px;
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  color: var(--tg-theme-accent-text-color);
`;

const Main = styled.div`
  width: 100%;
  & > div {
    background-color: var(--tg-theme-secondary-bg-color);
  }
`;

// export const TgInputSection: FC<InpurSectionProps> = ({ children, header }) => {
//   return (
//     <TgSection header={header}>
//       <List>{children}</List>
//     </TgSection>
//   );
// };

// const TgSection = styled(Section)`
//   background: none;
//   border-radius: 1rem;
//   & > div {
//     background: none;
//     border-radius: 1rem;
//     box-shadow: none;
//     & > div {
//       background-color: transparent;
//       & > div {
//         background-color: transparent;
//       }
//     }
//   }
// `;
